CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -Iinclude

SRCDIR = src
INCDIR = include
BUILDDIR = build
TARGET = netvision_daemon

SOURCES = $(wildcard $(SRCDIR)/*.cpp)
OBJECTS = $(patsubst $(SRCDIR)/%.cpp, $(BUILDDIR)/%.o, $(SOURCES))

$(TARGET): $(OBJECTS)
	@echo " Linking..."
	$(CXX) $^ -o $(TARGET)

$(BUILDDIR)/%.o: $(SRCDIR)/%.cpp
	@mkdir -p $(BUILDDIR)
	$(CXX) $(CXXFLAGS) -c -o $@ $<

clean:
	@echo " Cleaning..."; 
	$(RM) -r $(BUILDDIR) $(TARGET)

.PHONY: clean
