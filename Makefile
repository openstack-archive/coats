all: info clean test dist upload release
.PHONY: all docs upload info req dist

PACKAGE_NAME := $(shell python setup.py --name)
PACKAGE_VERSION := $(shell python setup.py --version)
PYTHON_PATH := $(shell which python)
PLATFORM := $(shell uname -s | awk '{print tolower($$0)}')
ifeq ($(PLATFORM), darwin)
	DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
else
	DIR := $(shell dirname $(realpath $(MAKEFILE_LIST)))
endif
PYTHON_VERSION := $(shell python3 -c "import sys; print('py%s%s' % sys.version_info[0:2] + ('-conda' if 'conda' in sys.version or 'Continuum' in sys.version else ''))")
ifneq (,$(findstring conda, $(PYTHON_VERSION)))
	#CONDA := $(shell conda info --envs | grep '*' | awk '{print $$1}')
	CONDA := $(CONDA_DEFAULT_ENV)
endif

PREFIX :=
ifndef GIT_BRANCH
GIT_BRANCH=$(shell git branch | sed -n '/\* /s///p')
endif

info:
	@echo "INFO:	Building $(PACKAGE_NAME):$(PACKAGE_VERSION) on $(GIT_BRANCH) branch"
	@echo "INFO:	Python $(PYTHON_VERSION) from '$(PREFIX)' [$(CONDA)]"

clean:
	@find . -name "*.pyc" -delete
	@rm -rf .tox dist/* docs/build/*

package:
	python setup.py sdist bdist_wheel build_sphinx

install: prepare
	$(PREFIX)pip install .

uninstall:
	$(PREFIX)pip uninstall -y $(PACKAGE_NAME)

test:
	$(PREFIX)tox

dist:
	rm -f dist/*
	$(PREFIX)python setup.py sdist bdist_wheel

upload: dist
	@echo "INFO:	Upload package to pypi.python.org"
	$(PREFIX)python setup.py check --restructuredtext --strict
	$(PREFIX)twine upload dist/*
