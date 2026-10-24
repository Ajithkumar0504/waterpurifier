import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const CalifncoApp());
}

class CalifncoApp extends StatelessWidget {
  const CalifncoApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'Califnco Water',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF087E8B)),
      scaffoldBackgroundColor: const Color(0xFFF5F8FA),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF087E8B),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
    ),
    home: const AuthGate(),
  );
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});
  @override
  Widget build(BuildContext context) => StreamBuilder<User?>(
    stream: FirebaseAuth.instance.authStateChanges(),
    builder: (context, snap) {
      if (snap.connectionState == ConnectionState.waiting) {
        return const Scaffold(body: Center(child: CircularProgressIndicator()));
      }
      return snap.data == null ? const LoginScreen() : const HomeScreen();
    },
  );
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final email = TextEditingController();
  final password = TextEditingController();
  final name = TextEditingController();
  String role = 'customer';
  bool register = false, busy = false;
  String? error;

  Future<void> submit() async {
    setState(() { busy = true; error = null; });
    try {
      final auth = FirebaseAuth.instance;
      if (register) {
        final credential = await auth.createUserWithEmailAndPassword(
          email: email.text.trim(), password: password.text,
        );
        await FirebaseFirestore.instance.collection('users').doc(credential.user!.uid).set({
          'name': name.text.trim(),
          'email': email.text.trim(),
          'role': role,
          'dealerStatus': role == 'dealer' ? 'pending' : 'not_applicable',
          'createdAt': FieldValue.serverTimestamp(),
        });
      } else {
        await auth.signInWithEmailAndPassword(
          email: email.text.trim(), password: password.text,
        );
      }
    } on FirebaseAuthException catch (e) {
      setState(() => error = e.message ?? e.code);
    } catch (e) {
      setState(() => error = e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  // Quick Guest Login for Customer convenience
  Future<void> continueAsGuest() async {
    setState(() { busy = true; error = null; });
    try {
      await FirebaseAuth.instance.signInAnonymously();
    } catch (e) {
      setState(() => error = e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: Center(child: SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 420),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const Icon(Icons.water_drop, size: 72, color: Color(0xFF087E8B)),
          const SizedBox(height: 8),
          const Text('Califnco Water', textAlign: TextAlign.center,
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF087E8B))),
          const Text('Pure, Safe & Mineral-Rich Water Solutions', textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: Colors.grey)),
          const SizedBox(height: 28),
          if (register) ...[
            TextField(controller: name, decoration: const InputDecoration(labelText: 'Full name', border: OutlineInputBorder())),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: role, decoration: const InputDecoration(labelText: 'Account type', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'customer', child: Text('Customer (Retail)')),
                DropdownMenuItem(value: 'dealer', child: Text('Dealer (Wholesale Pricing)')),
              ],
              onChanged: (v) => setState(() => role = v ?? 'customer'),
            ),
            const SizedBox(height: 12),
          ],
          TextField(controller: email, keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(labelText: 'Email address', border: OutlineInputBorder())),
          const SizedBox(height: 12),
          TextField(controller: password, obscureText: true,
            decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder())),
          if (error != null) Padding(padding: const EdgeInsets.only(top: 12),
            child: Text(error!, style: const TextStyle(color: Colors.red))),
          const SizedBox(height: 16),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF087E8B), padding: const EdgeInsets.symmetric(vertical: 14)),
            onPressed: busy ? null : submit,
            child: Text(busy ? 'Please wait…' : register ? 'Create account' : 'Sign in', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold))),
          const SizedBox(height: 8),
          TextButton(onPressed: () => setState(() { register = !register; error = null; }),
            child: Text(register ? 'Already registered? Sign in' : 'New dealer / customer? Create account')),
          const Divider(height: 32),
          OutlinedButton.icon(
            icon: const Icon(Icons.person_outline),
            label: const Text('Browse as Customer (Quick Access)'),
            onPressed: busy ? null : continueAsGuest,
          ),
        ]),
      ),
    )),
  );
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final Map<String, Map<String, dynamic>> cart = {};
  String category = 'All';
  int tab = 0;
  String promoCode = '';
  double discountRate = 0.0;
  String promoMessage = '';

  User get user => FirebaseAuth.instance.currentUser!;

  Future<Map<String, dynamic>> get profile async {
    if (user.isAnonymous) {
      return {'role': 'customer', 'name': 'Guest Customer', 'dealerStatus': 'none'};
    }
    final snap = await FirebaseFirestore.instance.collection('users').doc(user.uid).get();
    return snap.data() ?? {'role': 'customer'};
  }

  void applyPromo() {
    if (promoCode.trim().toUpperCase() == 'CALIFNCO10') {
      setState(() {
        discountRate = 0.10;
        promoMessage = '10% Referral Discount Applied!';
      });
    } else {
      setState(() {
        discountRate = 0.0;
        promoMessage = 'Invalid promo code (use CALIFNCO10)';
      });
    }
  }

  Future<void> placeOrder(bool isDealer) async {
    if (cart.isEmpty) return;
    final addressController = TextEditingController();
    final phoneController = TextEditingController();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Checkout Order'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: phoneController, decoration: const InputDecoration(labelText: 'Phone Number', border: OutlineInputBorder()), keyboardType: TextInputType.phone),
            const SizedBox(height: 10),
            TextField(controller: addressController, decoration: const InputDecoration(labelText: 'Delivery Address', border: OutlineInputBorder()), maxLines: 2),
            const SizedBox(height: 10),
            Text(isDealer ? 'Payment: Dealer 30-Day Wholesale Credit' : 'Payment: Cash on Delivery / Razorpay Test', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF087E8B))),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF087E8B)),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Confirm Order'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final subtotal = cart.values.fold<num>(0, (sum, item) => sum + (item['price'] as num) * (item['qty'] as int));
    final total = subtotal - (subtotal * discountRate);

    await FirebaseFirestore.instance.collection('orders').add({
      'userId': user.uid,
      'customerName': user.displayName ?? (user.isAnonymous ? 'Guest Customer' : user.email),
      'customerPhone': phoneController.text.trim().isEmpty ? '9876543210' : phoneController.text.trim(),
      'customerAddress': addressController.text.trim().isEmpty ? 'Customer Address' : addressController.text.trim(),
      'role': isDealer ? 'dealer' : 'customer',
      'items': cart.values.toList(),
      'subtotal': subtotal,
      'discount': subtotal * discountRate,
      'total': total,
      'status': 'pending',
      'paymentStatus': isDealer ? 'Wholesale Credit (Pending)' : 'Paid (Razorpay Test Mode)',
      'createdAt': FieldValue.serverTimestamp(),
    });

    if (!mounted) return;
    setState(cart.clear);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Order placed successfully! Califnco order is processing.')));
  }

  Future<void> bookService() async {
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final addressController = TextEditingController();
    final issueController = TextEditingController();
    String serviceType = 'RO Filter Replacement';
    String brand = 'Califnco Aqua';

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Book Purifier Service'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: serviceType,
                  decoration: const InputDecoration(labelText: 'Service Type', border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: 'New Installation', child: Text('New Installation')),
                    DropdownMenuItem(value: 'RO Filter Replacement', child: Text('RO Filter Replacement')),
                    DropdownMenuItem(value: 'Purifier Repair / Leakage', child: Text('Purifier Repair / Leakage')),
                    DropdownMenuItem(value: 'Annual AMC Coverage', child: Text('Annual AMC Coverage')),
                  ],
                  onChanged: (v) => setDialogState(() => serviceType = v ?? serviceType),
                ),
                const SizedBox(height: 10),
                TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder())),
                const SizedBox(height: 10),
                TextField(controller: phoneController, decoration: const InputDecoration(labelText: 'Phone Number', border: OutlineInputBorder()), keyboardType: TextInputType.phone),
                const SizedBox(height: 10),
                TextField(controller: addressController, decoration: const InputDecoration(labelText: 'Service Address', border: OutlineInputBorder())),
                const SizedBox(height: 10),
                TextField(controller: issueController, decoration: const InputDecoration(labelText: 'Problem Description', border: OutlineInputBorder())),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: const Color(0xFF087E8B)),
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Book Doorstep Service'),
            ),
          ],
        ),
      ),
    );

    if (ok != true) return;
    await FirebaseFirestore.instance.collection('serviceRequests').add({
      'userId': user.uid,
      'customerName': nameController.text.trim().isEmpty ? 'Customer' : nameController.text.trim(),
      'phone': phoneController.text.trim().isEmpty ? '9840123456' : phoneController.text.trim(),
      'serviceType': serviceType,
      'brand': brand,
      'address': addressController.text.trim().isEmpty ? 'Service Location' : addressController.text.trim(),
      'notes': issueController.text.trim(),
      'status': 'Technician Pending Assignment',
      'createdAt': FieldValue.serverTimestamp(),
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Service request submitted! Technician will be assigned.')));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Califnco Water Purifier'),
      actions: [
        IconButton(
          tooltip: 'Sign out',
          onPressed: () => FirebaseAuth.instance.signOut(),
          icon: const Icon(Icons.logout),
        ),
      ],
    ),
    bottomNavigationBar: NavigationBar(
      selectedIndex: tab,
      onDestinationSelected: (v) => setState(() => tab = v),
      destinations: [
        const NavigationDestination(icon: Icon(Icons.storefront), label: 'Products'),
        NavigationDestination(
          icon: Badge(
            isLabelVisible: cart.isNotEmpty,
            label: Text('${cart.values.fold<int>(0, (s, i) => s + (i['qty'] as int))}'),
            child: const Icon(Icons.shopping_cart),
          ),
          label: 'Cart',
        ),
        const NavigationDestination(icon: Icon(Icons.receipt_long), label: 'Orders'),
        const NavigationDestination(icon: Icon(Icons.build_circle_outlined), label: 'Service'),
      ],
    ),
    body: FutureBuilder<Map<String, dynamic>>(
      future: profile,
      builder: (context, profileSnap) {
        final p = profileSnap.data ?? {};
        final isApprovedDealer = p['role'] == 'dealer' && p['dealerStatus'] == 'approved';

        if (tab == 1) return _cartView(isApprovedDealer);
        if (tab == 2) return _ordersView();
        if (tab == 3) return _serviceView();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner
            Container(
              width: double.infinity,
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isApprovedDealer
                    ? [const Color(0xFF15803D), const Color(0xFF16A34A)]
                    : [const Color(0xFF087E8B), const Color(0xFF0284C7)],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isApprovedDealer ? '🏢 Gold Dealer Partner' : 'Pure Water. Healthy Life.',
                    style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isApprovedDealer
                      ? 'Wholesale distributor pricing active (save up to 35%). Net 30-day credit limit: ₹50,000'
                      : '50 genuine RO purifiers, UV filters, pumps & spare parts with doorstep installation.',
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ],
              ),
            ),

            // Categories Filter (5 Califnco Assignment Categories)
            SizedBox(
              height: 46,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                children: [
                  for (final c in ['All', 'Purifiers', 'Dispensers', 'Pumps', 'Filters', 'Spares'])
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: ChoiceChip(
                        label: Text(c),
                        selected: category == c,
                        selectedColor: const Color(0xFF087E8B),
                        labelStyle: TextStyle(
                          color: category == c ? Colors.white : Colors.black87,
                          fontWeight: FontWeight.bold,
                        ),
                        onSelected: (_) => setState(() => category = c),
                      ),
                    ),
                ],
              ),
            ),

            // Products Grid
            Expanded(
              child: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
                stream: FirebaseFirestore.instance.collection('products').where('active', isEqualTo: true).snapshots(),
                builder: (context, snap) {
                  if (snap.hasError) return Center(child: Text('Products error: ${snap.error}'));
                  if (!snap.hasData) return const Center(child: CircularProgressIndicator());
                  final docs = snap.data!.docs.where((d) => category == 'All' || d.data()['category'] == category).toList();

                  if (docs.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.inventory_2_outlined, size: 54, color: Colors.grey),
                            const SizedBox(height: 12),
                            const Text('No products found in this category.', style: TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            const Text('Open Admin Console to seed 50 products into Firestore.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 12)),
                          ],
                        ),
                      ),
                    );
                  }

                  return GridView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: docs.length,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: 0.64,
                    ),
                    itemBuilder: (context, i) {
                      final d = docs[i].data();
                      final id = docs[i].id;
                      final price = isApprovedDealer ? (d['wholesalePrice'] ?? d['price']) : d['price'];
                      final qty = cart[id]?['qty'] ?? 0;

                      return Card(
                        elevation: 2,
                        clipBehavior: Clip.antiAlias,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Stack(
                                children: [
                                  Image.network(
                                    d['imageUrl'] ?? '',
                                    width: double.infinity,
                                    height: double.infinity,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Container(
                                      color: const Color(0xFFE2E8F0),
                                      child: const Center(child: Icon(Icons.water_drop, size: 48, color: Color(0xFF087E8B))),
                                    ),
                                  ),
                                  Positioned(
                                    top: 6,
                                    left: 6,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(color: Colors.black87, borderRadius: BorderRadius.circular(4)),
                                      child: Text(d['category'] ?? '', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(8),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    d['name'] ?? 'Product',
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Text('₹$price', style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF087E8B), fontSize: 15)),
                                      const SizedBox(width: 4),
                                      if (isApprovedDealer)
                                        const Text('(Wholesale)', style: TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold))
                                      else
                                        Text('₹${(price * 1.25).toInt()}', style: const TextStyle(color: Colors.grey, fontSize: 11, decoration: TextDecoration.lineThrough)),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  SizedBox(
                                    width: double.infinity,
                                    child: FilledButton(
                                      style: FilledButton.styleFrom(
                                        backgroundColor: const Color(0xFF087E8B),
                                        padding: EdgeInsets.zero,
                                        visualDensity: VisualDensity.compact,
                                      ),
                                      onPressed: () => setState(() {
                                        cart[id] = {
                                          'productId': id,
                                          'name': d['name'],
                                          'price': price,
                                          'qty': qty + 1,
                                          'imageUrl': d['imageUrl'],
                                        };
                                      }),
                                      child: Text(qty > 0 ? 'Added ($qty)' : 'Add to Cart', style: const TextStyle(fontSize: 12)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        );
      },
    ),
  );

  Widget _cartView(bool isDealer) {
    final subtotal = cart.values.fold<num>(0, (sum, item) => sum + (item['price'] as num) * (item['qty'] as int));
    final discount = subtotal * discountRate;
    final total = subtotal - discount;

    return cart.isEmpty
      ? const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.remove_shopping_cart, size: 64, color: Colors.grey),
              SizedBox(height: 12),
              Text('Your cart is empty', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              SizedBox(height: 4),
              Text('Browse products and add purifiers to cart.', style: TextStyle(color: Colors.grey)),
            ],
          ),
        )
      : Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(12),
                children: [
                  for (final item in cart.values)
                    Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: const Icon(Icons.water_drop, color: Color(0xFF087E8B)),
                        title: Text(item['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        subtitle: Text('₹${item['price']} × ${item['qty']} = ₹${item['price'] * item['qty']}'),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove),
                              onPressed: () => setState(() {
                                if (item['qty'] > 1) {
                                  item['qty']--;
                                } else {
                                  cart.remove(item['productId']);
                                }
                              }),
                            ),
                            Text('${item['qty']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                            IconButton(
                              icon: const Icon(Icons.add),
                              onPressed: () => setState(() {
                                item['qty']++;
                              }),
                            ),
                          ],
                        ),
                      ),
                    ),

                  const SizedBox(height: 12),
                  // Promo Code Box
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Referral / Promo Code', style: TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  decoration: const InputDecoration(
                                    hintText: 'Enter CALIFNCO10',
                                    border: OutlineInputBorder(),
                                    isDense: true,
                                  ),
                                  onChanged: (v) => promoCode = v,
                                ),
                              ),
                              const SizedBox(width: 8),
                              FilledButton(
                                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF087E8B)),
                                onPressed: applyPromo,
                                child: const Text('Apply'),
                              ),
                            ],
                          ),
                          if (promoMessage.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 6),
                              child: Text(
                                promoMessage,
                                style: TextStyle(
                                  color: discountRate > 0 ? Colors.green : Colors.red,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),
                  // Summary Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.between,
                            children: [
                              const Text('Subtotal:'),
                              Text('₹$subtotal', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          if (discount > 0) ...[
                            const SizedBox(height: 6),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.between,
                              children: [
                                const Text('Promo Discount (10%):', style: TextStyle(color: Colors.green)),
                                Text('- ₹${discount.toInt()}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ],
                          const Divider(height: 18),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.between,
                            children: [
                              const Text('Total Payable:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              Text('₹${total.toInt()}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF087E8B))),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF087E8B),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  onPressed: cart.isEmpty ? null : () => placeOrder(isDealer),
                  child: Text('Checkout • ₹${total.toInt()}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ),
          ],
        );
  }

  Widget _ordersView() => StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
    stream: FirebaseFirestore.instance.collection('orders').where('userId', isEqualTo: user.uid).snapshots(),
    builder: (context, snap) {
      if (!snap.hasData) return const Center(child: CircularProgressIndicator());
      if (snap.data!.docs.isEmpty) {
        return const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.receipt_long, size: 54, color: Colors.grey),
              SizedBox(height: 12),
              Text('No orders yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              SizedBox(height: 4),
              Text('Your placed orders will show up here.', style: TextStyle(color: Colors.grey)),
            ],
          ),
        );
      }
      return ListView(
        padding: const EdgeInsets.all(12),
        children: snap.data!.docs.map((d) {
          final o = d.data();
          return Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: ListTile(
              leading: const CircleAvatar(
                backgroundColor: Color(0xFFE0F2FE),
                child: Icon(Icons.water_drop, color: Color(0xFF087E8B)),
              ),
              title: Text('Order ₹${o['total']}', style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('Status: ${o['status'] ?? 'pending'}\nPayment: ${o['paymentStatus'] ?? 'unpaid'}'),
              trailing: Chip(
                label: Text('${o['status'] ?? 'pending'}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                backgroundColor: const Color(0xFFDCFCE7),
              ),
            ),
          );
        }).toList(),
      );
    },
  );

  Widget _serviceView() => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.build_circle, size: 72, color: Color(0xFF087E8B)),
          const SizedBox(height: 14),
          const Text('Califnco Service Desk', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text(
            'Need installation, filter cartridge change, or urgent repairs? Our certified technicians are ready.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF087E8B),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            ),
            onPressed: bookService,
            icon: const Icon(Icons.build),
            label: const Text('Book Doorstep Service', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    ),
  );
}
