import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../utils/theme.dart';
import '../services/shift_service.dart';

class ScheduleScreen extends StatefulWidget {
  @override
  _ScheduleScreenState createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  List<Map<String, dynamic>> _shifts = [];
  bool _isLoading = true;
  String _currentTime = DateFormat('h:mm a').format(DateTime.now().toUtc().add(Duration(hours: 5, minutes: 30))); // 08:07 PM IST

  @override
  void initState() {
    super.initState();
    _loadShifts();
    _updateTimePeriodically();
  }

  Future<void> _loadShifts() async {
    setState(() => _isLoading = true);
    try {
      final shifts = await ShiftService.getAllShifts();
      setState(() {
        _shifts = shifts;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      String errorMessage = e.toString();
      if (errorMessage.contains('403')) {
        errorMessage = 'Access denied. Please log in again or contact support.';
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: AppTheme.errorRed,
          action: SnackBarAction(
            label: 'Retry',
            textColor: AppTheme.primaryBlue,
            onPressed: _loadShifts,
          ),
        ),
      );
    }
  }

  void _updateTimePeriodically() {
    Future.doWhile(() async {
      await Future.delayed(Duration(seconds: 1));
      if (mounted) {
        setState(() {
          _currentTime = DateFormat('h:mm a').format(DateTime.now().toUtc().add(Duration(hours: 5, minutes: 30)));
        });
      }
      return true;
    });
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('My Schedule', style: TextStyle(color: AppTheme.darkGray)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: IconThemeData(color: AppTheme.darkGray),
        actions: [
          Padding(
            padding: EdgeInsets.only(right: 16.0),
            child: Text(
              _currentTime,
              style: TextStyle(fontSize: 16, color: AppTheme.darkGray, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: AppTheme.primaryBlue))
          : _shifts.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.calendar_today, size: 80, color: AppTheme.primaryBlue.withOpacity(0.6)),
                      SizedBox(height: 20),
                      Text(
                        'Your schedule will appear here!',
                        style: TextStyle(fontSize: 18, color: AppTheme.darkGray),
                      ),
                      SizedBox(height: 10),
                      Text(
                        'Stay tuned for updates or check your permissions.',
                        style: TextStyle(fontSize: 14, color: AppTheme.lightGray),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: EdgeInsets.all(20),
                  itemCount: _shifts.length,
                  itemBuilder: (context, index) {
                    final shift = _shifts[index];
                    final DateTime now = DateTime.now().toUtc().add(Duration(hours: 5, minutes: 30)); // 08:07 PM IST
                    final DateTime shiftStart = DateFormat('HH:mm').parse(shift['startTime']).add(Duration(hours: 5, minutes: 30));
                    final DateTime shiftEnd = DateFormat('HH:mm').parse(shift['endTime']).add(Duration(hours: 5, minutes: 30));
                    final bool isActiveShift = now.isAfter(shiftStart) && now.isBefore(shiftEnd) && shift['workingDays']?.contains('tuesday') == true;

                    return Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      color: isActiveShift ? AppTheme.lightBlue : null,
                      child: ListTile(
                        leading: Icon(Icons.schedule, color: AppTheme.primaryBlue),
                        title: Text(
                          shift['name'] ?? 'Unnamed Shift',
                          style: TextStyle(fontWeight: FontWeight.w600, color: AppTheme.darkGray),
                        ),
                        subtitle: Text(
                          '${shift['startTime']} - ${shift['endTime']} (${shift['workingDays']?.join(', ') ?? 'N/A'})',
                          style: TextStyle(color: AppTheme.lightGray),
                        ),
                        trailing: isActiveShift
                            ? Icon(Icons.check_circle, color: AppTheme.successGreen)
                            : null,
                      ),
                    );
                  },
                ),
    );
  }
}