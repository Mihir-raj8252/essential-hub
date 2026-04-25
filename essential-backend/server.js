const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors'); 
const multer = require('multer'); 
const path = require('path');    

const app = express();
const PORT = 4000;

app.use(cors()); 
app.use(express.json());

// ✅ Images folder ko public banaya taaki website par photos dikhein
app.use('/images', express.static(path.join(__dirname, 'images')));

// --- MONGODB CONNECTION ---
const dbURI = "mongodb+srv://essentialhubonlinecom_db_user:Adimihi%407070@cluster0.d7eaexb.mongodb.net/EssentialHub?retryWrites=true&w=majority";

mongoose.connect(dbURI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// --- MULTER SETUP ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); 
    }
});
const upload = multer({ storage: storage });

// --- SCHEMAS ---
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    tag: String,
    images: [String],    
    image: String,       
    fabric: String,      
    description: String  
});
const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
    customerName: String,
    customerPhone: String,
    customerEmail: String,
    shippingAddress: Object,
    items: Array,
    totalAmount: String,
    paymentMethod: String, 
    status: { type: String, default: "Pending" }, 
    orderDate: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// --- API ROUTES ---

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Products load nahi ho paye" });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product nahi mila" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/api/products', upload.array('productImages', 5), async (req, res) => {
    try {
        const imagePaths = req.files.map(file => 'images/' + file.filename);
        const productData = {
            name: req.body.name,
            price: Number(req.body.price),
            tag: req.body.tag,
            fabric: req.body.fabric,
            description: req.body.description,
            images: imagePaths,
            image: imagePaths[0] 
        };
        const newProduct = new Product(productData);
        await newProduct.save();
        res.status(201).json({ message: "Product added successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to add product" });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: "Order placed successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Order failed" });
    }
});

app.get('/api/user-orders/:email', async (req, res) => {
    try {
        const orders = await Order.find({ customerEmail: req.params.email }).sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Orders fetch error" });
    }
});

app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Admin orders error" });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json({ message: "Status Updated!", order: updatedOrder });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});
// <<--- Yahan par purane routes khatam ho rahe honge --- >>

// ✅ 8. Delete Product Route (Ise yahan paste karo)
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.json({ message: "Product deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete product" });
    }
});

// Ye line aapke code mein pehle se hogi, iske upar hi rehna chahiye
app.listen(PORT, () => {
    console.log(`✅ Server is running on: http://localhost:${PORT}`);
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on: http://localhost:${PORT}`);
});