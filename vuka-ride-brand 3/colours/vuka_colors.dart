import 'package:flutter/material.dart';

/// Vuka Ride brand colours
class VukaColors {
  VukaColors._();

  static const Color deepGreen = Color(0xFF064E2B);
  static const Color vukaGreen = Color(0xFF0B8F3E);
  static const Color sunriseOrange = Color(0xFFF57C00);
  static const Color sunGold = Color(0xFFFFB300);
  static const Color forestNight = Color(0xFF04371F);
  static const Color ink = Color(0xFF111827);
  static const Color slate = Color(0xFF4B5563);
  static const Color mist = Color(0xFFF5F7F5);
  static const Color leaf = Color(0xFFD1FAE5);
  static const Color white = Color(0xFFFFFFFF);

  static const LinearGradient brandGradient = LinearGradient(
    begin: Alignment.topLeft, end: Alignment.bottomRight,
    colors: [vukaGreen, forestNight],
  );
  static const LinearGradient sunGradient = LinearGradient(
    begin: Alignment.topCenter, end: Alignment.bottomCenter,
    colors: [sunGold, Color(0xFFFF7A00)],
  );

  /// Material colour scheme starting point (light).
  static ColorScheme get lightScheme => ColorScheme.fromSeed(
        seedColor: vukaGreen,
        primary: vukaGreen,
        onPrimary: white,
        secondary: sunriseOrange,
        surface: white,
        onSurface: ink,
      );
}
