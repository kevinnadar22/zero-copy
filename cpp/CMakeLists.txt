cmake_minimum_required(VERSION 3.16)
project(zero-copy-benchmark CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Build Cap'n Proto from local source
set(BUILD_TESTING OFF CACHE BOOL "" FORCE)
add_subdirectory(${CMAKE_SOURCE_DIR}/../capnproto-c++-1.5.0 capnproto-c++-1.5.0)

# Fetch nlohmann/json header-only
include(FetchContent)
FetchContent_Declare(json
    URL https://github.com/nlohmann/json/releases/download/v3.11.3/json.tar.xz
)
FetchContent_MakeAvailable(json)

add_executable(benchmark main.cpp user.capnp.c++)
target_include_directories(benchmark PRIVATE
    ${CMAKE_SOURCE_DIR}/../capnproto-c++-1.5.0/src
    ${CMAKE_CURRENT_BINARY_DIR}/capnproto-c++-1.5.0/src
)
target_link_libraries(benchmark PRIVATE capnp kj nlohmann_json::nlohmann_json)
