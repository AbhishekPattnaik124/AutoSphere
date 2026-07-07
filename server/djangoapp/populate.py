from .models import CarMake, CarModel


def initiate():
    """
    Seed the Django database with a curated set of car makes and models.
    Only called when the database has no existing CarMake records.
    """
    car_make_data = [
        {
            "name": "NISSAN",
            "description": "Japanese automotive giant renowned for reliability, innovation, and pioneering electric vehicles like the Nissan Leaf.",
            "country_of_origin": "Japan",
            "founded_year": 1933,
        },
        {
            "name": "Mercedes-Benz",
            "description": "German luxury automotive icon, defining premium engineering since 1926 with unmatched elegance, safety, and performance.",
            "country_of_origin": "Germany",
            "founded_year": 1926,
        },
        {
            "name": "Audi",
            "description": "German precision manufacturer celebrated for Quattro all-wheel drive, cutting-edge interiors, and motorsport heritage.",
            "country_of_origin": "Germany",
            "founded_year": 1909,
        },
        {
            "name": "Kia",
            "description": "South Korean automaker delivering outstanding value, bold design, and award-winning warranties across every segment.",
            "country_of_origin": "South Korea",
            "founded_year": 1944,
        },
        {
            "name": "Toyota",
            "description": "World's largest automaker, synonymous with durability, hybrid leadership (Prius), and legendary resale value.",
            "country_of_origin": "Japan",
            "founded_year": 1937,
        },
        {
            "name": "BMW",
            "description": "Bavarian Motor Works — the ultimate driving machine, balancing athletic performance with refined luxury.",
            "country_of_origin": "Germany",
            "founded_year": 1916,
        },
        {
            "name": "Ford",
            "description": "American automotive pioneer that democratized the automobile, now leading in electric trucks and commercial vehicles.",
            "country_of_origin": "United States",
            "founded_year": 1903,
        },
    ]

    car_make_instances = {}
    for data in car_make_data:
        instance = CarMake.objects.create(
            name=data['name'],
            description=data['description'],
            country_of_origin=data['country_of_origin'],
            founded_year=data['founded_year'],
        )
        car_make_instances[data['name']] = instance

    car_model_data = [
        # NISSAN
        {"name": "Pathfinder",  "type": "SUV",       "year": 2024, "make": "NISSAN"},
        {"name": "Qashqai",     "type": "SUV",       "year": 2024, "make": "NISSAN"},
        {"name": "X-Trail",     "type": "SUV",       "year": 2024, "make": "NISSAN"},
        {"name": "Altima",      "type": "SEDAN",     "year": 2024, "make": "NISSAN"},
        {"name": "Leaf",        "type": "HATCHBACK", "year": 2024, "make": "NISSAN"},

        # Mercedes-Benz
        {"name": "A-Class",     "type": "SEDAN",     "year": 2024, "make": "Mercedes-Benz"},
        {"name": "C-Class",     "type": "SEDAN",     "year": 2024, "make": "Mercedes-Benz"},
        {"name": "E-Class",     "type": "SEDAN",     "year": 2024, "make": "Mercedes-Benz"},
        {"name": "GLE",         "type": "SUV",       "year": 2024, "make": "Mercedes-Benz"},
        {"name": "AMG GT",      "type": "COUPE",     "year": 2024, "make": "Mercedes-Benz"},

        # Audi
        {"name": "A4",          "type": "SEDAN",     "year": 2024, "make": "Audi"},
        {"name": "A5",          "type": "COUPE",     "year": 2024, "make": "Audi"},
        {"name": "A6",          "type": "SEDAN",     "year": 2024, "make": "Audi"},
        {"name": "Q5",          "type": "SUV",       "year": 2024, "make": "Audi"},
        {"name": "Q7",          "type": "SUV",       "year": 2024, "make": "Audi"},

        # Kia
        {"name": "Sorento",     "type": "SUV",       "year": 2024, "make": "Kia"},
        {"name": "Carnival",    "type": "MINIVAN",   "year": 2024, "make": "Kia"},
        {"name": "Cerato",      "type": "SEDAN",     "year": 2024, "make": "Kia"},
        {"name": "Stinger",     "type": "SEDAN",     "year": 2024, "make": "Kia"},
        {"name": "Sportage",    "type": "SUV",       "year": 2024, "make": "Kia"},

        # Toyota
        {"name": "Corolla",     "type": "SEDAN",     "year": 2024, "make": "Toyota"},
        {"name": "Camry",       "type": "SEDAN",     "year": 2024, "make": "Toyota"},
        {"name": "Kluger",      "type": "SUV",       "year": 2024, "make": "Toyota"},
        {"name": "RAV4",        "type": "SUV",       "year": 2024, "make": "Toyota"},
        {"name": "HiLux",       "type": "TRUCK",     "year": 2024, "make": "Toyota"},

        # BMW
        {"name": "3 Series",    "type": "SEDAN",     "year": 2024, "make": "BMW"},
        {"name": "5 Series",    "type": "SEDAN",     "year": 2024, "make": "BMW"},
        {"name": "X5",          "type": "SUV",       "year": 2024, "make": "BMW"},
        {"name": "M3",          "type": "SEDAN",     "year": 2024, "make": "BMW"},
        {"name": "4 Series",    "type": "COUPE",     "year": 2024, "make": "BMW"},

        # Ford
        {"name": "F-150",       "type": "TRUCK",     "year": 2024, "make": "Ford"},
        {"name": "Mustang",     "type": "COUPE",     "year": 2024, "make": "Ford"},
        {"name": "Explorer",    "type": "SUV",       "year": 2024, "make": "Ford"},
        {"name": "Focus",       "type": "HATCHBACK", "year": 2024, "make": "Ford"},
        {"name": "Maverick",    "type": "TRUCK",     "year": 2024, "make": "Ford"},
    ]

    for data in car_model_data:
        make_instance = car_make_instances.get(data['make'])
        if make_instance:
            CarModel.objects.create(
                name=data['name'],
                car_make=make_instance,
                type=data['type'],
                year=data['year'],
            )
