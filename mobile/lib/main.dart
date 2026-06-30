import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/booking_flow.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const TripzoMobileApp());
}

class TripzoMobileApp extends StatelessWidget {
  const TripzoMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tripzo Mobility',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.system,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Inter',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4F66FF),
          primary: const Color(0xFF4F66FF),
          secondary: const Color(0xFF06B6D4),
          background: const Color(0xFFF8FAFC),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: TextStyle(
            color: Color(0xFF0F172A),
            fontWeight: FontWeight.extrabold,
            fontSize: 16,
          ),
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Inter',
        colorScheme: ColorScheme.fromSeed(
          brightness: Brightness.dark,
          seedColor: const Color(0xFF4F66FF),
          primary: const Color(0xFF4F66FF),
          secondary: const Color(0xFF06B6D4),
          background: const Color(0xFF020617),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F172A),
          elevation: 0,
          centerTitle: true,
        ),
      ),
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  double _loadProgress = 0.0;
  String _statusText = 'Planning your route...';

  @override
  void initState() {
    super.initState();
    _startLoading();
  }

  void _startLoading() {
    final statusMap = {
      0.15: 'Retrieving luxury coach schedules...',
      0.40: 'Verifying available seat maps...',
      0.65: 'Syncing executive boarding terminals...',
      0.85: 'Securing seat vault gateways...',
      0.98: 'Welcome aboard Tripzo. Preparing boarding...',
    };

    Future.doWhile(() async {
      await Future.delayed(const Duration(milliseconds: 30));
      if (!mounted) return false;
      
      setState(() {
        _loadProgress += 0.01;
        for (var entry in statusMap.entries) {
          if ((_loadProgress - entry.key).abs() < 0.005) {
            _statusText = entry.value;
          }
        }
      });

      if (_loadProgress >= 1.0) {
        _checkSession();
        return false;
      }
      return true;
    });
  }

  Future<void> _checkSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('tripzo_token') ?? '';

    if (mounted) {
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 700),
          pageBuilder: (_, __, ___) => token.isNotEmpty 
              ? const MainBookingFlow(initialIndex: 0) 
              : const LoginScreen(),
          transitionsBuilder: (_, animation, __, child) {
            return FadeTransition(
              opacity: animation,
              child: ScaleTransition(
                scale: Tween<double>(begin: 0.97, end: 1.0).animate(
                  CurvedAnimation(parent: animation, curve: Curves.easeInOutCubic),
                ),
                child: child,
              ),
            );
          },
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0F172A), Color(0xFF020617)],
          ),
        ),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Top Minimal HUD Header
              Padding(
                padding: const EdgeInsets.only(top: 24.0, left: 24, right: 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.explore_outlined, color: Colors.cyan.withOpacity(0.7), size: 14),
                        const SizedBox(width: 6),
                        Text(
                          'TRIPZO PREMIUM MOBILITY',
                          style: TextStyle(
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                            color: Colors.white.withOpacity(0.4),
                            letterSpacing: 1.2,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Text(
                          'BOARDING ACTIVE',
                          style: TextStyle(
                            fontSize: 7.5,
                            fontWeight: FontWeight.bold,
                            color: Colors.white.withOpacity(0.3),
                            letterSpacing: 1.0,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Container(
                          width: 4,
                          height: 4,
                          decoration: const BoxDecoration(
                            color: Colors.emerald,
                            shape: BoxShape.circle,
                          ),
                        )
                      ],
                    ),
                  ],
                ),
              ),

              // Main Centered Brand Logo & Animated Bus Path
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Centered large Tripzo integrated logo
                      const Center(
                        child: TripzoBrandLogoWidget(height: 52),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'YOUR PREMIUM JOURNEY BEGINS HERE',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: Colors.white.withOpacity(0.5),
                          letterSpacing: 2.0,
                        ),
                      ),
                      const SizedBox(height: 48),

                      // Animated Highway Lane & Sliding 2D Coach Bus
                      LayoutBuilder(
                        builder: (context, constraints) {
                          final double trackWidth = constraints.maxWidth;
                          final double busWidth = 46.0;
                          // Slide position from center/left boundary to right boundary
                          final double leftPosition = (_loadProgress * (trackWidth - busWidth))
                              .clamp(0.0, trackWidth - busWidth);

                          return SizedBox(
                            height: 32,
                            width: double.infinity,
                            child: Stack(
                              clipBehavior: Clip.none,
                              children: [
                                // Thin highway divider line
                                Positioned(
                                  left: 0,
                                  right: 0,
                                  bottom: 8,
                                  child: Container(
                                    height: 2.5,
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.08),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                ),
                                // Glowing active journey trace line
                                Positioned(
                                  left: 0,
                                  width: _loadProgress * trackWidth,
                                  bottom: 8,
                                  child: Container(
                                    height: 2.5,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(10),
                                      gradient: const LinearGradient(
                                        colors: [Color(0xFF6366F1), Color(0xFF06B6D4)],
                                      ),
                                    ),
                                  ),
                                ),
                                // Sliding 2D Bus silhouette
                                Positioned(
                                  left: leftPosition,
                                  bottom: 10,
                                  child: CustomPaint(
                                    size: Size(busWidth, 18),
                                    painter: Sleek2DBusPainter(),
                                  ),
                                ),
                                // Start Pin
                                Positioned(
                                  left: 0,
                                  bottom: -8,
                                  child: Text(
                                    'START',
                                    style: TextStyle(
                                      fontSize: 6.5,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white.withOpacity(0.25),
                                    ),
                                  ),
                                ),
                                // End Pin
                                Positioned(
                                  right: 0,
                                  bottom: -8,
                                  child: Text(
                                    'DEST',
                                    style: TextStyle(
                                      fontSize: 6.5,
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF06B6D4).withOpacity(0.7),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),

              // Bottom Loader Card
              Padding(
                padding: const EdgeInsets.only(bottom: 32.0, left: 24.0, right: 24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            _statusText.toUpperCase(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: Colors.white.withOpacity(0.4),
                              fontFamily: 'monospace',
                              letterSpacing: 1.0,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${(_loadProgress * 100).toInt()}%',
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.black,
                            color: Color(0xFF06B6D4),
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'TRIPZO CO., LTD. ALL RIGHTS RESERVED',
                          style: TextStyle(
                            fontSize: 7,
                            color: Colors.white.withOpacity(0.15),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Row(
                          children: [
                            Icon(Icons.lock_outline, color: Colors.emerald, size: 9),
                            SizedBox(width: 3),
                            Text(
                              'SECURE GATEWAY',
                              style: TextStyle(
                                fontSize: 7,
                                color: Colors.emerald,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        )
                      ],
                    ),
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

// -------------------------------------------------------------
// Sleek 2D Bus Custom Painter
// -------------------------------------------------------------
class Sleek2DBusPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double scale = size.width / 46.0;

    final busPaint = Paint()
      ..color = const Color(0xFF06B6D4)
      ..style = PaintingStyle.fill;

    final darkPaint = Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.fill;

    // Main Bus Body RRect
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(0, 0, size.width, 13 * scale),
        Radius.circular(3.5 * scale),
      ),
      busPaint,
    );

    // Front Windshield Glass path
    final windshieldPath = Path()
      ..moveTo(37 * scale, 0)
      ..lineTo(42 * scale, 0)
      ..cubicTo(44 * scale, 0, 45 * scale, 1.5 * scale, 45 * scale, 3.5 * scale)
      ..lineTo(43 * scale, 9 * scale)
      ..lineTo(37 * scale, 9 * scale)
      ..close();
    canvas.drawPath(windshieldPath, darkPaint);

    // Side Windows
    for (double i = 0; i < 4; i++) {
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH((4 + i * 8) * scale, 2 * scale, 6 * scale, 4.5 * scale),
          Radius.circular(0.8 * scale),
        ),
        darkPaint,
      );
    }

    // Wheels
    final wheelPaint = Paint()
      ..color = const Color(0xFF334155)
      ..style = PaintingStyle.fill;
    final wheelBorder = Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.8 * scale;

    final Offset w1 = Offset(11 * scale, 13.5 * scale);
    final Offset w2 = Offset(34 * scale, 13.5 * scale);
    final double radius = 3.2 * scale;

    canvas.drawCircle(w1, radius, wheelPaint);
    canvas.drawCircle(w1, radius, wheelBorder);
    canvas.drawCircle(w2, radius, wheelPaint);
    canvas.drawCircle(w2, radius, wheelBorder);

    // Headlight glowing beam
    final lightPaint = Paint()
      ..color = const Color(0xFFFEF08A).withOpacity(0.8)
      ..style = PaintingStyle.fill;
    final lightBeam = Path()
      ..moveTo(45 * scale, 7 * scale)
      ..lineTo(51 * scale, 6.5 * scale)
      ..quadraticBezierTo(52 * scale, 7.5 * scale, 51 * scale, 7.5 * scale)
      ..lineTo(45 * scale, 8 * scale)
      ..close();
    canvas.drawPath(lightBeam, lightPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// -------------------------------------------------------------
// Tripzo Unified Brand Logo Widget with integrated iconography
// -------------------------------------------------------------
class TripzoBrandLogoWidget extends StatefulWidget {
  final double height;
  const TripzoBrandLogoWidget({super.key, this.height = 40});

  @override
  State<TripzoBrandLogoWidget> createState() => _TripzoBrandLogoWidgetState();
}

class _TripzoBrandLogoWidgetState extends State<TripzoBrandLogoWidget> with TickerProviderStateMixin {
  late AnimationController _bounceController;
  late AnimationController _pingController;

  @override
  void initState() {
    super.initState();
    _bounceController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _pingController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat();
  }

  @override
  void dispose() {
    _bounceController.dispose();
    _pingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: widget.height,
      width: widget.height * (280 / 60),
      child: AnimatedBuilder(
        animation: Listenable.merge([_bounceController, _pingController]),
        builder: (context, child) {
          return CustomPaint(
            painter: TripzoBrandLogoPainter(
              bounceValue: _bounceController.value,
              pingValue: _pingController.value,
            ),
            size: Size(widget.height * (280 / 60), widget.height),
          );
        },
      ),
    );
  }
}

class TripzoBrandLogoPainter extends CustomPainter {
  final double bounceValue;
  final double pingValue;
  TripzoBrandLogoPainter({required this.bounceValue, required this.pingValue});

  @override
  void paint(Canvas canvas, Size size) {
    final double scale = size.height / 60.0;
    
    final fillPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final bgPaint = Paint()
      ..color = const Color(0xFF020617)
      ..style = PaintingStyle.fill;

    // 1. T
    final Path tPath = Path()
      ..moveTo(10 * scale, 6 * scale)
      ..lineTo(42 * scale, 6 * scale)
      ..lineTo(42 * scale, 15 * scale)
      ..lineTo(31 * scale, 15 * scale)
      ..lineTo(31 * scale, 54 * scale)
      ..lineTo(21 * scale, 54 * scale)
      ..lineTo(21 * scale, 15 * scale)
      ..lineTo(10 * scale, 15 * scale)
      ..close();
    canvas.drawPath(tPath, fillPaint);

    // 2. R with integrated walking traveler cutout inside leg
    final Path rPath = Path()
      ..moveTo(48 * scale, 6 * scale)
      ..lineTo(74 * scale, 6 * scale)
      ..quadraticBezierTo(84 * scale, 6 * scale, 84 * scale, 18 * scale)
      ..quadraticBezierTo(84 * scale, 28 * scale, 72 * scale, 30 * scale)
      ..lineTo(82 * scale, 54 * scale)
      ..lineTo(71 * scale, 54 * scale)
      ..lineTo(62 * scale, 30 * scale)
      ..lineTo(58 * scale, 30 * scale)
      ..lineTo(58 * scale, 54 * scale)
      ..lineTo(48 * scale, 54 * scale)
      ..close();
    canvas.drawPath(rPath, fillPaint);

    final Path rCutout = Path()
      ..moveTo(58 * scale, 14 * scale)
      ..lineTo(70 * scale, 14 * scale)
      ..quadraticBezierTo(75 * scale, 14 * scale, 75 * scale, 18 * scale)
      ..quadraticBezierTo(75 * scale, 22 * scale, 70 * scale, 22 * scale)
      ..lineTo(58 * scale, 22 * scale)
      ..close();
    canvas.drawPath(rCutout, bgPaint);

    // Traveler Silhouette walking inside the lower R leg (cut out in bg color)
    canvas.drawCircle(Offset(73.5 * scale, 38.5 * scale), 2.2 * scale, bgPaint);
    
    final Path travelerBody = Path()
      ..moveTo(71.5 * scale, 41.5 * scale)
      ..lineTo(75.5 * scale, 41.5 * scale)
      ..lineTo(77 * scale, 47.5 * scale)
      ..lineTo(75.5 * scale, 54 * scale)
      ..lineTo(73.5 * scale, 54 * scale)
      ..lineTo(74.5 * scale, 48 * scale)
      ..lineTo(72.5 * scale, 49 * scale)
      ..lineTo(71.5 * scale, 54 * scale)
      ..lineTo(69.5 * scale, 54 * scale)
      ..lineTo(71 * scale, 47 * scale)
      ..lineTo(70 * scale, 42.5 * scale)
      ..close();
    canvas.drawPath(travelerBody, bgPaint);

    // Tilted suitcase trolley cutout
    canvas.save();
    canvas.translate(65.5 * scale, 44.5 * scale);
    canvas.rotate(-15 * math.pi / 180);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(-2.5 * scale, -5 * scale, 5 * scale, 10 * scale),
        Radius.circular(0.8 * scale),
      ),
      bgPaint,
    );
    canvas.restore();

    final Paint handlePaint = Paint()
      ..color = const Color(0xFF020617)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0 * scale
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(Offset(67.5 * scale, 41 * scale), Offset(70.5 * scale, 43 * scale), handlePaint);

    // 3. I with bouncing blue pin replacing the dot
    final Path iPath = Path()
      ..moveTo(90 * scale, 18 * scale)
      ..lineTo(100 * scale, 18 * scale)
      ..lineTo(100 * scale, 54 * scale)
      ..lineTo(90 * scale, 54 * scale)
      ..close();
    canvas.drawPath(iPath, fillPaint);

    final double bounceOffset = math.sin(bounceValue * 2 * math.pi) * 3.5 * scale;
    final double pinCenterX = 95 * scale;
    final double pinCenterY = 7 * scale + bounceOffset;

    // Concentric pulsing radar ring under pin
    final radarPaint = Paint()
      ..color = const Color(0xFF06B6D4).withOpacity((1.0 - pingValue).clamp(0.0, 1.0))
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.1 * scale;
    canvas.drawCircle(Offset(pinCenterX, 14 * scale), 2 * scale + pingValue * 6 * scale, radarPaint);

    // Pin custom path
    final Path pinPath = Path()
      ..moveTo(pinCenterX, pinCenterY + 7 * scale)
      ..cubicTo(pinCenterX - 4.5 * scale, pinCenterY + 3 * scale, pinCenterX - 4.5 * scale, pinCenterY, pinCenterX - 4.5 * scale, pinCenterY - 4.5 * scale)
      ..cubicTo(pinCenterX - 4.5 * scale, pinCenterY - 7 * scale, pinCenterX - 2.5 * scale, pinCenterY - 9 * scale, pinCenterX, pinCenterY - 9 * scale)
      ..cubicTo(pinCenterX + 2.5 * scale, pinCenterY - 9 * scale, pinCenterX + 4.5 * scale, pinCenterY - 7 * scale, pinCenterX + 4.5 * scale, pinCenterY - 4.5 * scale)
      ..cubicTo(pinCenterX + 4.5 * scale, pinCenterY, pinCenterX + 4.5 * scale, pinCenterY + 3 * scale, pinCenterX, pinCenterY + 7 * scale)
      ..close();
    canvas.drawPath(pinPath, Paint()..color = const Color(0xFF06B6D4)..style = PaintingStyle.fill);
    // White dot inside pin
    canvas.drawCircle(Offset(pinCenterX, pinCenterY - 4.5 * scale), 1.5 * scale, fillPaint);

    // 4. P
    final Path pPath = Path()
      ..moveTo(108 * scale, 6 * scale)
      ..lineTo(132 * scale, 6 * scale)
      ..quadraticBezierTo(140 * scale, 6 * scale, 140 * scale, 18 * scale)
      ..quadraticBezierTo(140 * scale, 30 * scale, 132 * scale, 30 * scale)
      ..lineTo(118 * scale, 30 * scale)
      ..lineTo(118 * scale, 54 * scale)
      ..lineTo(108 * scale, 54 * scale)
      ..close();
    canvas.drawPath(pPath, fillPaint);

    final Path pCutout = Path()
      ..moveTo(118 * scale, 14 * scale)
      ..lineTo(128 * scale, 14 * scale)
      ..quadraticBezierTo(131 * scale, 14 * scale, 131 * scale, 18 * scale)
      ..quadraticBezierTo(131 * scale, 22 * scale, 128 * scale, 22 * scale)
      ..lineTo(118 * scale, 22 * scale)
      ..close();
    canvas.drawPath(pCutout, bgPaint);

    // 5. Z
    final Path zPath = Path()
      ..moveTo(146 * scale, 6 * scale)
      ..lineTo(178 * scale, 6 * scale)
      ..lineTo(178 * scale, 15 * scale)
      ..lineTo(158 * scale, 45 * scale)
      ..lineTo(178 * scale, 45 * scale)
      ..lineTo(178 * scale, 54 * scale)
      ..lineTo(146 * scale, 54 * scale)
      ..lineTo(146 * scale, 45 * scale)
      ..lineTo(166 * scale, 15 * scale)
      ..lineTo(146 * scale, 15 * scale)
      ..close();
    canvas.drawPath(zPath, fillPaint);

    // 6. O with detailed front-view luxury coach bus silhouette inside
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(184 * scale, 6 * scale, 34 * scale, 48 * scale),
        Radius.circular(16 * scale),
      ),
      fillPaint,
    );

    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(191.5 * scale, 13.5 * scale, 19 * scale, 33 * scale),
        Radius.circular(6 * scale),
      ),
      bgPaint,
    );

    // Luxury front-view Coach Bus inside O loop
    final double oBusLeft = 193 * scale;
    final double oBusTop = 19.5 * scale;
    final double oBusSize = 16 * scale;
    
    // Outer chassis
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(oBusLeft, oBusTop, oBusSize, oBusSize), Radius.circular(2.5 * scale)),
      fillPaint,
    );

    // Windshield
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(oBusLeft + 1.5 * scale, oBusTop + 1.5 * scale, 13 * scale, 7.5 * scale), Radius.circular(0.8 * scale)),
      bgPaint,
    );

    // Headlights
    final yellowPaint = Paint()..color = const Color(0xFFFEF08A);
    canvas.drawCircle(Offset(oBusLeft + 3.5 * scale, oBusTop + 12.5 * scale), 1.3 * scale, yellowPaint);
    canvas.drawCircle(Offset(oBusLeft + 12.5 * scale, oBusTop + 12.5 * scale), 1.3 * scale, yellowPaint);

    // Grille/Logo
    final grillePaint = Paint()..color = const Color(0xFF475569);
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(oBusLeft + 6 * scale, oBusTop + 12 * scale, 4 * scale, 2 * scale), Radius.circular(0.4 * scale)),
      grillePaint,
    );

    // Tagline Underneath - Center Aligned
    final TextPainter tpTagline = TextPainter(
      text: TextSpan(
        text: '—  B U S   B O O K I N G   S Y S T E M  —',
        style: TextStyle(
          color: Colors.white.withOpacity(0.5),
          fontSize: 7.2 * scale,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.8,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    tpTagline.paint(canvas, Offset(20 * scale, 58 * scale));

    // Register Mark
    final TextPainter tpReg = TextPainter(
      text: TextSpan(
        text: '®',
        style: TextStyle(
          color: Colors.white.withOpacity(0.9),
          fontSize: 8 * scale,
          fontWeight: FontWeight.bold,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    tpReg.paint(canvas, Offset(224 * scale, 6 * scale));
  }

  @override
  bool shouldRepaint(covariant TripzoBrandLogoPainter oldDelegate) {
    return oldDelegate.bounceValue != bounceValue || oldDelegate.pingValue != pingValue;
  }
}

