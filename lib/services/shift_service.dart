import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class ShiftService {
  static const String baseUrl = 'http://localhost:3000/api';

  static Future<List<Map<String, dynamic>>> getAllShifts() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/shifts'),
        headers: AuthService.getAuthHeaders(),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return List<Map<String, dynamic>>.from(data['shifts']);
        }
        throw Exception(data['message'] ?? 'Failed to load shifts');
      } else {
        throw Exception('Server error: ${response.statusCode}');
      }
    } catch (e) {
      print('Error getting all shifts: $e');
      return [];
    }
  }
}

