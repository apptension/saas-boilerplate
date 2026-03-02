#!/usr/bin/env python
"""
Standalone script to import bank transactions from CSV files.

This script can be run directly or via the Django management command.

Direct usage (requires Django settings):
    cd packages/backend
    export DJANGO_SETTINGS_MODULE=config.settings
    python ../../scripts/import_bank_transactions.py --tenant="Tenant Name" --csv-dir=/path/to/csvs --dry-run

Via Docker (recommended):
    docker compose exec backend python manage.py import_bank_transactions \
        --tenant="Tenant Name" \
        --csv-dir=/app/IMPORT \
        --dry-run

Via helper script:
    ./packages/backend/scripts/import_bank_transactions.sh "Tenant Name" --dry-run
"""

import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'packages', 'backend')
sys.path.insert(0, backend_path)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

# Now import and run the management command
from django.core.management import call_command
import argparse


def main():
    parser = argparse.ArgumentParser(
        description='Import bank transactions from CSV files into CostLine and RevenueLine models',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # Dry run (preview without saving)
    python import_bank_transactions.py --tenant="Unicornz" --csv-dir=./IMPORT --dry-run
    
    # Import all CSVs from directory
    python import_bank_transactions.py --tenant="Unicornz" --csv-dir=./IMPORT
    
    # Import single file
    python import_bank_transactions.py --tenant="Unicornz" --csv-file=./IMPORT/historia.csv

Categories Created:
    The script will automatically create FinancialType records for the following categories:
    
    COSTS:
        TAX_VAT, TAX_INCOME, SOCIAL_SECURITY, INSURANCE, BANK_FEES, MUNICIPAL,
        SUBSCRIPTIONS, FUEL, TRANSPORT, CAR_MAINTENANCE, GROCERIES, DINING,
        CASH_WITHDRAWAL, PERSONAL_TRANSFER, PRIVATE_LOAN, SHOPPING, HOME_IMPROVEMENT,
        ENTERTAINMENT, INTERNAL_TRANSFER, OFFICE_SUPPLIES, COMMUNICATION, SHIPPING,
        EQUIPMENT, OTHER_EXPENSE
    
    REVENUES:
        INVOICE, SALARY, REFUND, TAX_REFUND, INTERNAL_TRANSFER, OTHER_INCOME

Transaction Classification:
    Transactions are classified based on description patterns:
    
    - /VAT/...INV/ -> Invoice payments (REVENUE)
    - /TI/.../VAT-7 -> VAT tax payments (COST)
    - E-składka ZUS -> Social security (COST)
    - Wynagrodzenie członka zarządu -> Salary (REVENUE)
    - VISA SEL...PŁATNOŚĆ KARTĄ -> Card payments (COST)
    - etc.
        """
    )
    
    parser.add_argument(
        '--tenant',
        type=str,
        required=True,
        help='Name of the tenant to import transactions to',
    )
    parser.add_argument(
        '--csv-dir',
        type=str,
        help='Directory containing CSV files to import',
    )
    parser.add_argument(
        '--csv-file',
        type=str,
        help='Single CSV file to import',
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview import without saving to database',
    )
    
    args = parser.parse_args()
    
    # Build management command arguments
    cmd_args = [
        f'--tenant={args.tenant}',
    ]
    
    if args.csv_dir:
        cmd_args.append(f'--csv-dir={args.csv_dir}')
    if args.csv_file:
        cmd_args.append(f'--csv-file={args.csv_file}')
    if args.dry_run:
        cmd_args.append('--dry-run')
    
    # Run the management command
    call_command('import_bank_transactions', *cmd_args)


if __name__ == '__main__':
    main()
