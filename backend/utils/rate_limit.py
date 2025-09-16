"""
Simple rate limiting utilities
"""
from django.core.cache import cache
from django.http import JsonResponse
from functools import wraps
import time

def rate_limit(max_requests=100, window=3600):
    """
    Rate limiting decorator
    max_requests: Maximum number of requests allowed
    window: Time window in seconds (default: 1 hour)
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Get client IP
            client_ip = get_client_ip(request)
            cache_key = f"rate_limit_{client_ip}_{view_func.__name__}"
            
            # Get current request count
            current_requests = cache.get(cache_key, 0)
            
            if current_requests >= max_requests:
                return JsonResponse({
                    'error': 'Rate limit exceeded. Please try again later.'
                }, status=429)
            
            # Increment counter
            cache.set(cache_key, current_requests + 1, window)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip