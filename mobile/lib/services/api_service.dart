import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Set default localhost for Android Emulators / iOS Simulators (10.0.2.2 is Android host loopback)
  static const String baseUrl = 'http://10.0.2.2:5000/api';

  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('tripzo_token') ?? '';
    return {
      'Content-Type': 'application/json',
      if (token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  // --- Auth Endpoints ---
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final url = Uri.parse('$baseUrl/auth/login');
      final res = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['success'] == true) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('tripzo_token', data['token']);
        await prefs.setString('tripzo_user', jsonEncode(data['user']));
        return {'success': true, 'user': data['user']};
      }
      return {'success': false, 'message': data['message'] ?? 'Login failed'};
    } catch (e) {
      return {'success': false, 'message': 'Network connection failed: $e'};
    }
  }

  static Future<Map<String, dynamic>> register(String name, String email, String phone, String password) async {
    try {
      final url = Uri.parse('$baseUrl/auth/register');
      final res = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'fullName': name,
          'email': email,
          'phone': phone,
          'password': password,
        }),
      );

      final data = jsonDecode(res.body);
      if (res.statusCode == 251 && data['success'] == true) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('tripzo_token', data['token']);
        await prefs.setString('tripzo_user', jsonEncode(data['user']));
        return {'success': true, 'user': data['user']};
      }
      return {'success': false, 'message': data['message'] ?? 'Registration failed'};
    } catch (e) {
      return {'success': false, 'message': 'Network connection failed: $e'};
    }
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('tripzo_token');
    await prefs.remove('tripzo_user');
  }

  // --- Schedule Endpoints ---
  static Future<Map<String, dynamic>> getSchedules(String from, String to, String date) async {
    try {
      final queryParams = '?from=$from&to=$to&date=$date';
      final url = Uri.parse('$baseUrl/schedules$queryParams');
      final res = await http.get(url, headers: await _getHeaders());
      
      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'schedules': data['schedules']};
      }
      return {'success': false, 'message': data['message'] ?? 'Schedules fetch failed'};
    } catch (e) {
      return {'success': false, 'message': 'Could not fetch schedules.'};
    }
  }

  // --- Promo Endpoints ---
  static Future<Map<String, dynamic>> verifyCoupon(String code, double amount) async {
    try {
      final url = Uri.parse('$baseUrl/offers/verify');
      final res = await http.post(
        url,
        headers: await _getHeaders(),
        body: jsonEncode({'code': code, 'bookingAmount': amount}),
      );

      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'offer': data['offer']};
      }
      return {'success': false, 'message': data['message'] ?? 'Promo code invalid'};
    } catch (e) {
      return {'success': false, 'message': 'Promo verification failed.'};
    }
  }

  // --- Booking Endpoints ---
  static Future<Map<String, dynamic>> createBooking(String scheduleId, List<String> seats, List<Map<String, dynamic>> passengers, String? promoCode) async {
    try {
      final url = Uri.parse('$baseUrl/bookings');
      final res = await http.post(
        url,
        headers: await _getHeaders(),
        body: jsonEncode({
          'scheduleId': scheduleId,
          'seatsBooked': seats,
          'passengers': passengers,
          if (promoCode != null) 'promoCode': promoCode,
        }),
      );

      final data = jsonDecode(res.body);
      if (res.statusCode == 251 && data['success'] == true) {
        return {'success': true, 'booking': data['booking']};
      }
      return {'success': false, 'message': data['message'] ?? 'Booking failed'};
    } catch (e) {
      return {'success': false, 'message': 'Booking request error.'};
    }
  }

  static Future<Map<String, dynamic>> confirmPayment(String bookingId, String method) async {
    try {
      final url = Uri.parse('$baseUrl/bookings/pay');
      final res = await http.post(
        url,
        headers: await _getHeaders(),
        body: jsonEncode({
          'bookingId': bookingId,
          'paymentMethod': method,
        }),
      );

      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'booking': data['booking']};
      }
      return {'success': false, 'message': data['message'] ?? 'Payment confirm failed'};
    } catch (e) {
      return {'success': false, 'message': 'Payment request error.'};
    }
  }

  static Future<Map<String, dynamic>> getMyBookings() async {
    try {
      final url = Uri.parse('$baseUrl/bookings/my');
      final res = await http.get(url, headers: await _getHeaders());
      
      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'bookings': data['bookings']};
      }
      return {'success': false, 'message': data['message'] ?? 'History fetch failed'};
    } catch (e) {
      return {'success': false, 'message': 'Could not fetch history.'};
    }
  }

  static Future<Map<String, dynamic>> cancelBooking(String id, String reason) async {
    try {
      final url = Uri.parse('$baseUrl/bookings/$id/cancel');
      final res = await http.post(
        url,
        headers: await _getHeaders(),
        body: jsonEncode({'reason': reason}),
      );

      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['success'] == true) {
        return {'success': true};
      }
      return {'success': false, 'message': data['message'] ?? 'Cancellation failed'};
    } catch (e) {
      return {'success': false, 'message': 'Cancellation request failed.'};
    }
  }
}
