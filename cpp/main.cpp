#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#undef INTERFACE
#else
#include <sys/resource.h>
#endif

#include <capnp/message.h>
#include <capnp/serialize.h>
#include <nlohmann/json.hpp>

#include <chrono>
#include <cstdlib>
#include <iostream>
#include <random>
#include <string>
#include <vector>
#include <cstring>
#include <cmath>

#include "user.capnp.h"

using json = nlohmann::json;
using Clock = std::chrono::high_resolution_clock;

struct UserData {
    uint64_t id;
    std::string name;
    std::string email;
    uint32_t age;
    bool isActive;
    double balance;
    std::string address;
    std::string phone;
};

struct LogEntryData {
    uint64_t timestamp;
    std::string level;
    std::string service;
    std::string message;
    std::string traceId;
    std::string metadata;
};

static std::string random_string(std::mt19937& rng, int len) {
    static const char chars[] = "abcdefghijklmnopqrstuvwxyz";
    std::uniform_int_distribution<int> dist(0, 25);
    std::string s(len, ' ');
    for (auto& c : s) c = chars[dist(rng)];
    return s;
}

static double get_cpu_seconds() {
#ifdef _WIN32
    FILETIME creation, exit, kernel, user;
    GetProcessTimes(GetCurrentProcess(), &creation, &exit, &kernel, &user);
    auto to_sec = [](FILETIME ft) {
        uint64_t t = (uint64_t)ft.dwHighDateTime << 32 | ft.dwLowDateTime;
        return t / 1e7;
    };
    return to_sec(kernel) + to_sec(user);
#else
    struct rusage ru;
    getrusage(RUSAGE_SELF, &ru);
    auto tv = [](struct timeval& t) { return t.tv_sec + t.tv_usec / 1e6; };
    return tv(ru.ru_utime) + tv(ru.ru_stime);
#endif
}

static double elapsed(Clock::time_point start) {
    return std::chrono::duration<double>(Clock::now() - start).count();
}

struct Metrics {
    double ser_duration = 0;
    double deser_duration = 0;
    double ser_cpu = 0;
    double deser_cpu = 0;
    size_t total_bytes = 0;
};

static const char* LEVELS[] = {"DEBUG", "INFO", "WARN", "ERROR", "FATAL"};
static const char* SERVICES[] = {"api-gateway", "auth-service", "user-service", "payment-service", "notification-service"};

void run_user_benchmark(int count, int batch_size) {
    std::mt19937 rng(42);
    std::uniform_int_distribution<int> age_dist(18, 80);
    std::uniform_int_distribution<int> bool_dist(0, 1);
    std::uniform_real_distribution<double> bal_dist(0.0, 100000.0);
    std::uniform_int_distribution<int> addr_num(1, 9999);
    std::uniform_int_distribution<int> phone1(200, 999);
    std::uniform_int_distribution<int> phone2(100, 999);
    std::uniform_int_distribution<int> phone3(1000, 9999);

    Metrics capnp_m{}, json_m{};
    int processed = 0;

    while (processed < count) {
        int current = std::min(batch_size, count - processed);
        std::vector<UserData> users(current);
        for (int i = 0; i < current; i++) {
            users[i].id = processed + i;
            users[i].name = random_string(rng, 8);
            users[i].email = "user" + std::to_string(processed + i) + "@example.com";
            users[i].age = age_dist(rng);
            users[i].isActive = bool_dist(rng);
            users[i].balance = std::round(bal_dist(rng) * 100.0) / 100.0;
            users[i].address = std::to_string(addr_num(rng)) + " " + random_string(rng, 10) + " St, " + random_string(rng, 6);
            users[i].phone = "+1-" + std::to_string(phone1(rng)) + "-" + std::to_string(phone2(rng)) + "-" + std::to_string(phone3(rng));
        }

        // Cap'n Proto serialize
        std::vector<kj::Array<capnp::word>> capnp_blobs;
        capnp_blobs.reserve(current);
        double cpu0 = get_cpu_seconds();
        auto t0 = Clock::now();
        for (auto& u : users) {
            ::capnp::MallocMessageBuilder builder;
            auto msg = builder.initRoot<User>();
            msg.setId(u.id);
            msg.setName(u.name);
            msg.setEmail(u.email);
            msg.setAge(u.age);
            msg.setIsActive(u.isActive);
            msg.setBalance(u.balance);
            msg.setAddress(u.address);
            msg.setPhone(u.phone);
            capnp_blobs.push_back(capnp::messageToFlatArray(builder));
        }
        capnp_m.ser_duration += elapsed(t0);
        capnp_m.ser_cpu += get_cpu_seconds() - cpu0;
        for (auto& b : capnp_blobs) capnp_m.total_bytes += b.size() * sizeof(capnp::word);

        // Cap'n Proto deserialize
        cpu0 = get_cpu_seconds();
        t0 = Clock::now();
        for (auto& blob : capnp_blobs) {
            capnp::FlatArrayMessageReader reader(blob.asPtr());
            auto d = reader.getRoot<User>();
            (void)d.getId(); (void)d.getName(); (void)d.getEmail();
            (void)d.getAge(); (void)d.getIsActive(); (void)d.getBalance();
            (void)d.getAddress(); (void)d.getPhone();
        }
        capnp_m.deser_duration += elapsed(t0);
        capnp_m.deser_cpu += get_cpu_seconds() - cpu0;

        // JSON serialize
        std::vector<std::string> json_blobs;
        json_blobs.reserve(current);
        cpu0 = get_cpu_seconds();
        t0 = Clock::now();
        for (auto& u : users) {
            json j;
            j["id"] = u.id; j["name"] = u.name; j["email"] = u.email;
            j["age"] = u.age; j["isActive"] = u.isActive; j["balance"] = u.balance;
            j["address"] = u.address; j["phone"] = u.phone;
            json_blobs.push_back(j.dump());
        }
        json_m.ser_duration += elapsed(t0);
        json_m.ser_cpu += get_cpu_seconds() - cpu0;
        for (auto& b : json_blobs) json_m.total_bytes += b.size();

        // JSON deserialize
        cpu0 = get_cpu_seconds();
        t0 = Clock::now();
        for (auto& raw : json_blobs) {
            auto d = json::parse(raw);
            (void)d["id"].get<uint64_t>(); (void)d["name"].get<std::string>();
            (void)d["email"].get<std::string>(); (void)d["age"].get<uint32_t>();
            (void)d["isActive"].get<bool>(); (void)d["balance"].get<double>();
            (void)d["address"].get<std::string>(); (void)d["phone"].get<std::string>();
        }
        json_m.deser_duration += elapsed(t0);
        json_m.deser_cpu += get_cpu_seconds() - cpu0;

        processed += current;

        // Progress line
        json progress;
        progress["type"] = "progress";
        progress["processed"] = processed;
        progress["total"] = count;
        progress["capnp"] = {
            {"ser_duration", capnp_m.ser_duration}, {"deser_duration", capnp_m.deser_duration},
            {"ser_cpu", capnp_m.ser_cpu}, {"deser_cpu", capnp_m.deser_cpu},
            {"total_bytes", capnp_m.total_bytes},
            {"ser_throughput", processed / capnp_m.ser_duration},
            {"deser_throughput", processed / capnp_m.deser_duration},
        };
        progress["json"] = {
            {"ser_duration", json_m.ser_duration}, {"deser_duration", json_m.deser_duration},
            {"ser_cpu", json_m.ser_cpu}, {"deser_cpu", json_m.deser_cpu},
            {"total_bytes", json_m.total_bytes},
            {"ser_throughput", processed / json_m.ser_duration},
            {"deser_throughput", processed / json_m.deser_duration},
        };
        std::cout << progress.dump() << "\n" << std::flush;
    }

    // Final result
    json result;
    result["type"] = "result";
    result["schema"] = "user";
    result["count"] = count;
    result["capnp"] = {
        {"ser_duration", capnp_m.ser_duration}, {"deser_duration", capnp_m.deser_duration},
        {"ser_cpu", capnp_m.ser_cpu}, {"deser_cpu", capnp_m.deser_cpu},
        {"total_bytes", capnp_m.total_bytes},
        {"avg_msg_bytes", (double)capnp_m.total_bytes / count},
        {"ser_throughput", count / capnp_m.ser_duration},
        {"deser_throughput", count / capnp_m.deser_duration},
    };
    result["json"] = {
        {"ser_duration", json_m.ser_duration}, {"deser_duration", json_m.deser_duration},
        {"ser_cpu", json_m.ser_cpu}, {"deser_cpu", json_m.deser_cpu},
        {"total_bytes", json_m.total_bytes},
        {"avg_msg_bytes", (double)json_m.total_bytes / count},
        {"ser_throughput", count / json_m.ser_duration},
        {"deser_throughput", count / json_m.deser_duration},
    };
    std::cout << result.dump() << "\n" << std::flush;
}

int main(int argc, char* argv[]) {
    std::string schema = "user";
    int count = 10000;
    int batch_size = 10000;

    for (int i = 1; i < argc; i++) {
        if (std::strcmp(argv[i], "--schema") == 0 && i + 1 < argc) schema = argv[++i];
        else if (std::strcmp(argv[i], "--count") == 0 && i + 1 < argc) count = std::atoi(argv[++i]);
        else if (std::strcmp(argv[i], "--batch") == 0 && i + 1 < argc) batch_size = std::atoi(argv[++i]);
    }

    if (batch_size <= 0) batch_size = 10000;
    if (count <= 0) count = 10000;

    run_user_benchmark(count, batch_size);

    return 0;
}
