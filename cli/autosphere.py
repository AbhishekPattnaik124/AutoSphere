import click
import requests
import json
import random
from datetime import datetime

API_BASE = "http://localhost"

@click.group()
def cli():
    """AutoSphere Developer CLI — Manage data and system health."""
    pass

@cli.command()
@click.option('--count', default=10, help='Number of synthetic cars to generate')
@click.option('--dealer-id', default=1, help='Dealer ID to assign cars to')
def seed_inventory(count, dealer_id):
    """Seed synthetic car records into the Inventory Microservice."""
    makes = ["Toyota", "Honda", "Ford", "BMW", "Tesla", "Audi", "Mercedes"]
    models = ["Camry", "Civic", "F-150", "M3", "Model S", "A4", "C-Class"]
    
    click.echo(f"🚀 Seeding {count} cars for Dealer {dealer_id}...")
    
    for _ in range(count):
        car = {
            "dealer_id": dealer_id,
            "make": random.choice(makes),
            "model": random.choice(models),
            "year": random.randint(2015, 2024),
            "mileage": random.randint(0, 100000),
            "price": random.randint(15000, 80000),
            "bodyType": random.choice(["Sedan", "SUV", "Truck", "Coupe"])
        }
        # In a real scenario, this would call an internal POST /cars endpoint
        click.echo(f"  [+] Generated: {car['year']} {car['make']} {car['model']} - ${car['price']}")

    click.secho("\n✅ Synthetic seeding complete (Dry Run Simulation).", fg='green', bold=True)

@cli.command()
def health():
    """Check health of all registered microservices."""
    services = {
        "Django Backend": "http://localhost:8000/djangoapp/get_dealers",
        "Dealer API": "http://localhost:3030/health",
        "Inventory API": "http://localhost:3050/health",
        "Sentiment API": "http://localhost:5050/health",
        "AI Recommend": "http://localhost:3070/health",
        "Booking Service": "http://localhost:3060/health",
        "Notification": "http://localhost:3080/health",
        "Audit Log": "http://localhost:3090/health"
    }

    click.echo("🔍 Checking AutoSphere Microservices Health...\n")
    
    for name, url in services.items():
        try:
            res = requests.get(url, timeout=2)
            if res.status_code < 400:
                click.echo(f"  {name:<18} : " + click.style("ONLINE", fg='green'))
            else:
                click.echo(f"  {name:<18} : " + click.style(f"DEGRADED ({res.status_code})", fg='yellow'))
        except:
            click.echo(f"  {name:<18} : " + click.style("OFFLINE", fg='red'))

    click.echo("\n✨ All checks complete.")

if __name__ == '__main__':
    cli()
