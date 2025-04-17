cmake_minimum_required(VERSION 3.25)
project($PROJECT_NAME$ LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 20)

add_executable($PROJECT_NAME$
    source/main.cpp
)
target_include_directories($PROJECT_NAME$ PRIVATE header)
