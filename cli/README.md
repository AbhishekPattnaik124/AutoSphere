# AutoSphere Developer CLI

A powerful command-line interface for managing the AutoSphere Microservices ecosystem.

## Installation

```bash
pip install click requests
```

## Usage

### 1. Check System Health
Monitor all microservices in one go:
```bash
python autosphere.py health
```

### 2. Seed Synthetic Data
Generate test car records for specific dealers:
```bash
python autosphere.py seed-inventory --count 20 --dealer-id 5
```

## Requirements
- Python 3.8+
- Active Docker Compose environment
