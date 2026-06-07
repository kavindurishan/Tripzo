import 'package:flutter/material';
import '../services/api_service.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ==========================================
// 1. AUTHENTICATION SCREENS
// ==========================================
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  String _error = '';

  Future<void> _handleLogin() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    final res = await ApiService.login(_emailController.text, _passwordController.text);
    
    if (mounted) {
      setState(() => _loading = false);
      if (res['success'] == true) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const MainBookingFlow(initialIndex: 0)),
        );
      } else {
        setState(() => _error = res['message']);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              Center(
                child: Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF4F66FF), Color(0xFF06B6D4)],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.compass_calibration, color: Colors.white, size: 28),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Welcome to Tripzo',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.black),
              ),
              const SizedBox(height: 6),
              const Text(
                'Log in to book your highway bus tickets',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Colors.grey),
              ),
              const SizedBox(height: 32),
              if (_error.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    border: Border.all(color: Colors.red.shade100),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _error,
                    style: TextStyle(color: Colors.red.shade800, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 16),
              ],
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  prefixIcon: const Icon(Icons.email_outlined),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(Icons.lock_outline),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                obscureText: true,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loading ? null : _handleLogin,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F66FF),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _loading 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Log In', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Don't have an account? ", style: TextStyle(fontSize: 12)),
                  GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
                    child: const Text(
                      'Register Now',
                      style: TextStyle(color: Color(0xFF4F66FF), fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 40),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(12)),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('💡 Demo Accounts:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                    SizedBox(height: 4),
                    Text('customer@tripzo.com / customer123', style: TextStyle(fontSize: 10, color: Colors.grey)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  String _error = '';

  Future<void> _handleRegister() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    final res = await ApiService.register(
      _nameController.text,
      _emailController.text,
      _phoneController.text,
      _passwordController.text,
    );

    if (mounted) {
      setState(() => _loading = false);
      if (res['success'] == true) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const MainBookingFlow(initialIndex: 0)),
        );
      } else {
        setState(() => _error = res['message']);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Account')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_error.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(12)),
                child: Text(_error, style: TextStyle(color: Colors.red.shade800, fontSize: 12)),
              ),
              const SizedBox(height: 16),
            ],
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Full Name',
                prefixIcon: const Icon(Icons.person_outline),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: 'Email Address',
                prefixIcon: const Icon(Icons.email_outlined),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _phoneController,
              decoration: InputDecoration(
                labelText: 'Phone Number',
                prefixIcon: const Icon(Icons.phone_outlined),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(
                labelText: 'Password',
                prefixIcon: const Icon(Icons.lock_outline),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              obscureText: true,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _handleRegister,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4F66FF),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _loading 
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Register', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

// ==========================================
// 2. MAIN BOTTOM NAVIGATION FLOW
// ==========================================
class MainBookingFlow extends StatefulWidget {
  final int initialIndex;
  const MainBookingFlow({super.key, required this.initialIndex});

  @override
  State<MainBookingFlow> createState() => _MainBookingFlowState();
}

class _MainBookingFlowState extends State<MainBookingFlow> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  final List<Widget> _tabs = [
    const HomeScreen(),
    const MyBookingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _tabs[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (idx) => setState(() => _currentIndex = idx),
        selectedItemColor: const Color(0xFF4F66FF),
        unselectedItemColor: Colors.grey,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
        unselectedLabelStyle: const TextStyle(fontSize: 11),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.confirmation_num), label: 'My Tickets'),
        ],
      ),
    );
  }
}

// ==========================================
// 3. SECTIONS: HOME SEARCH SCREEN
// ==========================================
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _fromInput = 'Colombo';
  String _toInput = 'Kandy';
  DateTime _selectedDate = DateTime.now();

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
    
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.compass_calibration, color: Color(0xFF4F66FF)),
            SizedBox(width: 8),
            Text('Tripzo Express', style: TextStyle(fontWeight: FontWeight.black)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ApiService.logout();
              if (mounted) {
                Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Promos Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF0F172A), Color(0xFF1E293B)]),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('DISCOUNT COUPON', style: TextStyle(color: Color(0xFF06B6D4), fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                  SizedBox(height: 6),
                  Text('Save 10% on express buses!', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text('Use code: TRIPZO10', style: TextStyle(color: Colors.grey, fontSize: 11)),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Search Fields Container
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(color: Colors.grey.shade200),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('LEAVING FROM', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                    DropdownButton<String>(
                      value: _fromInput,
                      isExpanded: true,
                      onChanged: (val) => setState(() => _fromInput = val!),
                      items: ['Colombo', 'Galle', 'Kandy', 'Matara'].map((city) {
                        return DropdownMenuItem(value: city, child: Text(city, style: const TextStyle(fontWeight: FontWeight.bold)));
                      }).toList(),
                    ),
                    const SizedBox(height: 16),
                    const Text('GOING TO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                    DropdownButton<String>(
                      value: _toInput,
                      isExpanded: true,
                      onChanged: (val) => setState(() => _toInput = val!),
                      items: ['Kandy', 'Colombo', 'Galle', 'Jaffna'].map((city) {
                        return DropdownMenuItem(value: city, child: Text(city, style: const TextStyle(fontWeight: FontWeight.bold)));
                      }).toList(),
                    ),
                    const SizedBox(height: 16),
                    const Text('TRAVEL DATE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(DateFormat('EEEE, d MMMM y').format(_selectedDate), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      trailing: const Icon(Icons.calendar_month, color: Color(0xFF4F66FF)),
                      onTap: _pickDate,
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => BusListScreen(from: _fromInput, to: _toInput, date: dateStr)),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF4F66FF),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.search),
                          SizedBox(width: 8),
                          Text('Search Trips', style: TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ==========================================
// 4. SCREEN: BUS LIST RESULTS SCREEN
// ==========================================
class BusListScreen extends StatefulWidget {
  final String from;
  final String to;
  final String date;
  const BusListScreen({super.key, required this.from, required this.to, required this.date});

  @override
  State<BusListScreen> createState() => _BusListScreenState();
}

class _BusListScreenState extends State<BusListScreen> {
  List<dynamic> _schedules = [];
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _loadSchedules();
  }

  Future<void> _loadSchedules() async {
    final res = await ApiService.getSchedules(widget.from, widget.to, widget.date);
    if (mounted) {
      setState(() {
        _loading = false;
        if (res['success'] == true) {
          _schedules = res['schedules'];
        } else {
          _error = res['message'];
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${widget.from} ➔ ${widget.to}')),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _error.isNotEmpty
          ? Center(child: Padding(padding: const EdgeInsets.all(20), child: Text(_error)))
          : _schedules.isEmpty
            ? const Center(child: Text('No active highway trips found.'))
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _schedules.length,
                itemBuilder: (context, idx) {
                  final item = _schedules[idx];
                  return Card(
                    margin: const EdgeInsets.bottom(16),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide(color: Colors.grey.shade200),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(item['bus']['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, py: 2),
                                decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(6)),
                                child: Text(item['bus']['type'], style: const TextStyle(color: Color(0xFF4F66FF), fontSize: 9, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item['departureTime'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  const Text('Departure', style: TextStyle(fontSize: 10, color: Colors.grey)),
                                ],
                              ),
                              const Icon(Icons.arrow_right_alt, color: Color(0xFF4F66FF)),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(item['arrivalTime'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  const Text('Arrival', style: TextStyle(fontSize: 10, color: Colors.grey)),
                                ],
                              ),
                            ],
                          ),
                          const Divider(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('\$${item['ticketPrice']} / seat', style: const TextStyle(fontWeight: FontWeight.black, color: Colors.green, fontSize: 16)),
                              ElevatedButton(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (_) => SeatSelectionScreen(schedule: item)),
                                  );
                                },
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F66FF), foregroundColor: Colors.white),
                                child: const Text('Book Now', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
    );
  }
}

// ==========================================
// 5. SCREEN: SEAT SELECTION & DETAILS SCREEN
// ==========================================
class SeatSelectionScreen extends StatefulWidget {
  final Map<String, dynamic> schedule;
  const SeatSelectionScreen({super.key, required this.schedule});

  @override
  State<SeatSelectionScreen> createState() => _SeatSelectionScreenState();
}

class _SeatSelectionScreenState extends State<SeatSelectionScreen> {
  final List<String> _selectedSeats = [];
  
  // Render dummy 40 seats visual list
  final List<String> _allSeats = List.generate(40, (i) {
    final row = (i ~/ 4) + 1;
    final letters = ['A', 'B', 'C', 'D'];
    return '$row${letters[i % 4]}';
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Select Seat Assignment')),
      body: Column(
        children: [
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text('🛞 Driver Engine Front', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
          ),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: _allSeats.length,
              itemBuilder: (context, idx) {
                final seatNum = _allSeats[idx];
                final isSelected = _selectedSeats.contains(seatNum);
                
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      if (isSelected) {
                        _selectedSeats.remove(seatNum);
                      } else {
                        _selectedSeats.add(seatNum);
                      }
                    });
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF4F66FF) : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: isSelected ? const Color(0xFF4F66FF) : Colors.grey.shade300),
                    ),
                    child: Center(
                      child: Text(
                        seatNum,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.white : Colors.black,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          SafeArea(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: Colors.grey.shade200))),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('${_selectedSeats.length} Seats selected', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ElevatedButton(
                    onPressed: _selectedSeats.isEmpty ? null : () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => PassengerDetailsScreen(schedule: widget.schedule, seats: _selectedSeats)),
                      );
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F66FF), foregroundColor: Colors.white),
                    child: const Text('Enter Details'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ==========================================
// 6. SCREEN: PASSENGER DETAILS SHEET
// ==========================================
class PassengerDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> schedule;
  final List<String> seats;
  const PassengerDetailsScreen({super.key, required this.schedule, required this.seats});

  @override
  State<PassengerDetailsScreen> createState() => _PassengerDetailsScreenState();
}

class _PassengerDetailsScreenState extends State<PassengerDetailsScreen> {
  final List<TextEditingController> _nameControllers = [];
  final List<TextEditingController> _ageControllers = [];
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    for (var i = 0; i < widget.seats.length; i++) {
      _nameControllers.add(TextEditingController());
      _ageControllers.add(TextEditingController());
    }
  }

  Future<void> _handleProceed() async {
    setState(() => _submitting = true);
    
    final List<Map<String, dynamic>> passDetails = [];
    for (var i = 0; i < widget.seats.length; i++) {
      passDetails.push({
        'fullName': _nameControllers[i].text,
        'age': int.tryParse(_ageControllers[i].text) ?? 25,
        'gender': 'Male',
        'seatNumber': widget.seats[i],
      });
    }

    final res = await ApiService.createBooking(
      widget.schedule['_id'],
      widget.seats,
      passDetails,
      null,
    );

    setState(() => _submitting = false);

    if (mounted) {
      if (res['success'] == true) {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => PaymentScreen(booking: res['booking'])),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res['message'])));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Passenger Profiles')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: widget.seats.length,
              itemBuilder: (context, idx) {
                return Card(
                  margin: const EdgeInsets.bottom(16),
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Seat ${widget.seats[idx]} Passenger', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF4F66FF))),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _nameControllers[idx],
                          decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _ageControllers[idx],
                          decoration: const InputDecoration(labelText: 'Age', border: OutlineInputBorder()),
                          keyboardType: TextInputType.number,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          SafeArea(
            child: Container(
              padding: const EdgeInsets.all(16),
              child: ElevatedButton(
                onPressed: _submitting ? null : _handleProceed,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F66FF),
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(50),
                ),
                child: _submitting 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Proceed to Payment', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ==========================================
// 7. SCREEN: TRANSACTION AND CHECKOUT SCREEN
// ==========================================
class PaymentScreen extends StatefulWidget {
  final Map<String, dynamic> booking;
  const PaymentScreen({super.key, required this.booking});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  bool _processing = false;

  Future<void> _confirmPay() async {
    setState(() => _processing = true);
    final res = await ApiService.confirmPayment(widget.booking['_id'], 'Card');
    setState(() => _processing = false);

    if (mounted) {
      if (res['success'] == true) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => TicketScreen(booking: res['booking'])),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment failed')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pay Ticket')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Total Booking Fee', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 4),
            Text(
              '\$${widget.booking['totalAmount']}',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.black, color: Colors.green),
            ),
            const SizedBox(height: 32),
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              color: Colors.black,
              child: const Padding(
                padding: EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Tripzo Boarding Card', style: TextStyle(color: Colors.grey, fontSize: 10)),
                    SizedBox(height: 24),
                    Text('•••• •••• •••• 4582', style: TextStyle(color: Colors.white, fontSize: 18, letterSpacing: 1.5)),
                    SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('JANE DOE', style: TextStyle(color: Colors.white, fontSize: 12)),
                        Text('12/28', style: TextStyle(color: Colors.white, fontSize: 12)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: _processing ? null : _confirmPay,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4F66FF),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _processing
                ? const CircularProgressIndicator(color: Colors.white)
                : const Text('Pay & Confirm Ticket', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

// ==========================================
// 8. SCREEN: BOARDING TICKET CONFIRMATION
// ==========================================
class TicketScreen extends StatelessWidget {
  final Map<String, dynamic> booking;
  const TicketScreen({super.key, required this.booking});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Boarding Ticket'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const MainBookingFlow(initialIndex: 0)),
            (route) => false,
          ),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              const Icon(Icons.check_circle, color: Colors.green, size: 64),
              const SizedBox(height: 16),
              const Text('Booking Confirmed!', style: TextStyle(fontWeight: FontWeight.black, fontSize: 20)),
              const SizedBox(height: 32),
              
              // Ticket visual card
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(booking['schedule']['route']['startingLocation'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                          const Icon(Icons.arrow_right_alt, color: Color(0xFF4F66FF)),
                          Text(booking['schedule']['route']['destination'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Seats: ${booking['seatsBooked'].join(', ')}', style: const TextStyle(fontWeight: FontWeight.bold)),
                          Text('Fare: \$${booking['totalAmount']}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                        ],
                      ),
                      const Divider(height: 32),
                      
                      // Mock QR code block
                      Container(
                        width: 140,
                        height: 140,
                        color: Colors.grey.shade100,
                        child: const Icon(Icons.qr_code_2, size: 100),
                      ),
                      const SizedBox(height: 12),
                      Text('BOARDING TOKEN: ${booking['_id'].toString().substring(0, 8).toUpperCase()}', style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ==========================================
// 9. SCREEN: CUSTOMER TIMELINE HISTORY LIST
// ==========================================
class MyBookingsScreen extends StatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen> {
  List<dynamic> _bookings = [];
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    final res = await ApiService.getMyBookings();
    if (mounted) {
      setState(() {
        _loading = false;
        if (res['success'] == true) {
          _bookings = res['bookings'];
        } else {
          _error = res['message'];
        }
      });
    }
  }

  Future<void> _cancelTrip(String bookingId) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Cancel'),
        content: const Text('Cancel this bus booking? Tripzo charges a 10% fee for processing cancellations.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Go Back')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Confirm')),
        ],
      ),
    );

    if (ok == true) {
      final res = await ApiService.cancelBooking(bookingId, 'Client requested refund');
      if (res['success'] == true) {
        _loadHistory();
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not cancel booking.')));
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Tripzo Bookings')),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _error.isNotEmpty
          ? Center(child: Text(_error))
          : _bookings.isEmpty
            ? const Center(child: Text('No historic tickets logged.'))
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _bookings.length,
                itemBuilder: (context, idx) {
                  final b = _bookings[idx];
                  final isCancelled = b['bookingStatus'] == 'Cancelled';
                  
                  return Card(
                    margin: const EdgeInsets.bottom(16),
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.grey.shade200)),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Voucher Ref: ${b['_id'].toString().substring(0,8).toUpperCase()}', style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
                              Text(
                                b['bookingStatus'],
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isCancelled ? Colors.red : Colors.green,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('${b['schedule']['route']['startingLocation']} ➔ ${b['schedule']['route']['destination']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                              Text('\$${b['totalAmount']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text('Seats: ${b['seatsBooked'].join(', ')}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                          const Divider(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(b['schedule']['departureDate'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              if (!isCancelled)
                                TextButton(
                                  onPressed: () => _cancelTrip(b['_id']),
                                  child: const Text('Cancel Trip', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 12)),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
    );
  }
}
