from django.contrib import admin
from .models import CarMake, CarModel


# ── CarModel Inline ────────────────────────────────────────────

class CarModelInline(admin.TabularInline):
    model = CarModel
    extra = 1
    fields = ('name', 'type', 'year')
    show_change_link = True


# ── CarModel Admin ─────────────────────────────────────────────

@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'car_make', 'type', 'year')
    list_filter = ('type', 'year', 'car_make')
    search_fields = ('name', 'car_make__name')
    ordering = ('car_make__name', 'name')
    list_select_related = ('car_make',)


# ── CarMake Admin ──────────────────────────────────────────────

@admin.register(CarMake)
class CarMakeAdmin(admin.ModelAdmin):
    inlines = [CarModelInline]
    list_display = ('name', 'description', 'country_of_origin', 'founded_year')
    search_fields = ('name', 'country_of_origin')
    ordering = ('name',)
