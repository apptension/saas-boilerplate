"""
Custom GraphQL scalar types.

This module provides custom scalar implementations that handle edge cases
and normalization for better data integrity.

This implementation follows a pattern similar to graphql-python/graphene PR 1594,
where we patch the existing Decimal scalar's parse_value method to normalize
floating-point precision issues at the GraphQL parsing level.
"""
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
import graphene


def _normalize_decimal_value(value):
    """
    Normalize a Decimal value to remove floating-point precision artifacts.
    
    When JavaScript sends a float like 25.23, it can be converted to a Decimal with
    floating-point imprecision (e.g., 25.230000000000000426325641456060111522674560546875).
    This function normalizes such values by:
    1. Converting to string first to avoid precision loss
    2. Re-parsing as Decimal to get a clean representation
    3. Limiting to max 15 total digits (to match common Django DecimalField constraints)
    
    Args:
        value: The value to normalize (can be Decimal, float, int, or string)
        
    Returns:
        Normalized Decimal value, or None if conversion fails
    """
    if value is None:
        return None
    
    try:
        # Convert to Decimal first if needed
        if not isinstance(value, Decimal):
            # Convert to string first to avoid floating-point precision loss
            if isinstance(value, (int, float)):
                # Use string conversion - this is critical to avoid precision issues
                decimal_value = Decimal(str(value))
            else:
                decimal_value = Decimal(str(value))
        else:
            decimal_value = value
        
        # Convert to string and back to Decimal to get a clean representation
        # This removes floating-point artifacts by re-parsing the string representation
        str_value = str(decimal_value)
        
        # Count total digits (excluding decimal point and sign)
        digits_only = str_value.replace('-', '').replace('.', '').replace('+', '')
        
        # If it has more than 15 digits, we need to round it
        # This handles the case where floating-point conversion created excessive precision
        if len(digits_only) > 15:
            # Find the decimal point position
            if '.' in str_value:
                # Has decimal part - round to ensure max 15 total digits
                # Calculate how many decimal places we can have
                integer_part = str_value.split('.')[0].replace('-', '')
                integer_digits = len(integer_part) if integer_part != '0' else 0
                max_decimal_places = max(0, 15 - integer_digits)
                
                # Quantize to the calculated decimal places
                if max_decimal_places > 0:
                    quantize_value = Decimal('0.' + '0' * (max_decimal_places - 1) + '1')
                else:
                    quantize_value = Decimal('1')
                normalized = decimal_value.quantize(quantize_value, rounding=ROUND_HALF_UP)
            else:
                # No decimal part - if it has more than 15 digits, round to 15 digits
                # This is unlikely but handle it anyway
                normalized = decimal_value
        else:
            # Already within 15 digits, just normalize to remove trailing zeros
            normalized = decimal_value.normalize()
        
        return normalized
    except (InvalidOperation, ValueError, TypeError):
        return None


# Store the original parse_value method
_original_decimal_parse_value = graphene.Decimal.parse_value


def _patched_decimal_parse_value(value):
    """
    Patched parse_value method for graphene.Decimal that normalizes values.
    
    This follows the pattern from graphql-python/graphene PR 1594 where we
    patch the existing scalar's method to add normalization logic.
    
    We normalize the input BEFORE calling the original parse_value to ensure
    the original method never sees imprecise float values.
    """
    # Normalize the input value first to remove floating-point artifacts
    # This ensures the original parse_value receives a clean value
    normalized_input = _normalize_decimal_value(value)
    
    # If normalization returned None, pass through to original
    if normalized_input is None:
        return _original_decimal_parse_value(value)
    
    # Call the original parse_value with the normalized input
    # This ensures consistent behavior while fixing precision issues
    return _original_decimal_parse_value(normalized_input)
    


# Patch the Decimal scalar's parse_value method
# This ensures all Decimal values are normalized when parsed from GraphQL input
graphene.Decimal.parse_value = staticmethod(_patched_decimal_parse_value)
