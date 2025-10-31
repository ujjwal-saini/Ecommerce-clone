const path = require("path");
const fs = require("fs");
const PORT = 9100;
const express = require("express");


const app = express();

// get  request for render page  in this rooute
app.use("/static", express.static("public"));

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/signup.html"));
});
app.get("/user", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/user.html"));
});
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/admin.html"));
});
app.get("/cart", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/cart.html"));
});

// signup work
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const filePathuser = path.join(__dirname, "json", "users.json");
app.post("/signup", (req, res) => {
    const { username, email, password, checkbox } = req.body;
    let users = [];
    const newuser = { username, email, password, checkbox };
    try {
        if (fs.existsSync(filePathuser)) {
            users = JSON.parse(fs.readFileSync(filePathuser, "utf-8"));
        }
    } catch (err) {
        console.error("Error reading or parsing the file:", err.message);
    }
    console.log(users);

    const matchedUsers = users.filter(user =>
        user?.email?.toLowerCase?.() === email.toLowerCase()
    );

    if (matchedUsers.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
    }
    users.push(newuser);
    fs.writeFileSync(filePathuser, JSON.stringify(users, null, 3));
    res.status(200).json({ message: "Data received" });
})


// sigin ka work jo ki user.json ma find karargi
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/signin", (req, res) => {
    const { email, password } = req.body;

    console.log("🟡 Incoming body:", req.body);

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    // Read users.json file
    let users = [];
    try {
        if (fs.existsSync(filePathuser)) {
            users = JSON.parse(fs.readFileSync(filePathuser, "utf-8"));
        }
    } catch (err) {
        console.error("❌ Error reading users file:", err.message);
        return res.status(500).json({ message: "Server error reading users." });
    }

    console.log("📄 All users loaded:", users);

    // Find user safely (filter out objects without email/password)
    const validUsers = users.filter(u => u.email && u.password);
    const finduser = validUsers.find(u =>u.email.trim() === email.trim() && u.password.trim() === password.trim());

    if (finduser) {
        if (users.length > 0 && users[0].currentemail !== undefined) {
            users[0].currentemail = email;

        } else {
            users.unshift({ currentemail: email });
        }

        try {
            fs.writeFileSync(filePathuser, JSON.stringify(users, null, 3));
        } catch (err) {
            console.error("Failed to write currentemail:", err.message);
        }


        if (finduser.checkbox === true) {
            res.sendFile(path.join(__dirname, "public/html/admin.html"));
            console.log("admin");
        } else {
            res.sendFile(path.join(__dirname, "public/html/user.html"));
            console.log("user");
        }
    } else {
        res.status(401).send("Invalid email or password");
        console.log("invalid email or password");
    }
});



// get  karna sara data product.json sa
const filePathproduct = path.join(__dirname, "json", "product.json");

app.get("/products", (req, res) => {
    try {
        const data = fs.readFileSync(filePathproduct, "utf-8");
        const products = JSON.parse(data);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Failed to load products" });
    }
});


// admin sa product data  json file ma store file name product.json
app.post("/admin", (req, res) => {
    const { product_img, product_name, product_quantity, product_price, product_discription } = req.body;
    const newproduct = { product_img, product_name, product_quantity, product_price, product_discription };
    console.log("newproduct", newproduct);
    let products = [];
    try {
        if (fs.existsSync(filePathproduct)) {
            products = JSON.parse(fs.readFileSync(filePathproduct, "utf-8"));
        }
    } catch (err) {
        console.error("json user file read error  ", err.message);
    }
    let finduser = products.find(product => product.product_name === product_name);
    console.log("post node", product_img, product_name, product_quantity, product_price, product_discription);
    console.log(finduser, product_name);
    if (!finduser) {
        products.push(newproduct);
        console.log("product add in json and check in json the product is exist or not");
        fs.writeFileSync(filePathproduct, JSON.stringify(products, null, 3));
        return res.status(200).json({ message: "Product added successfully" });

    } else {
        return res.status(400).json({ message: "this product is already in productlist" });
    }
});

// admin page pa product delete karna ka kam 
app.delete("/products/:name", (req, res) => {
    const productName = decodeURIComponent(req.params.name.trim().toLowerCase());
    console.log(productName);
    let products = [];

    try {
        if (fs.existsSync(filePathproduct)) {
            products = JSON.parse(fs.readFileSync(filePathproduct, "utf-8"));
        }

        const index = products.findIndex(product => product.product_name.trim() === productName);
        console.log(index);
        if (index === -1) {
            return res.status(404).json({ message: "Product not found" });
        }

        products.splice(index, 1); // delete the product
        fs.writeFileSync(filePathproduct, JSON.stringify(products, null, 3));

        return res.status(200).json({ message: "Product deleted successfully" });

    } catch (err) {
        console.error("Error deleting product:", err);
        return res.status(500).json({ message: "Failed to delete product" });
    }
});


// admin page product to edit ka kam
app.put("/edit", (req, res) => {
    const { old_name, product_img, product_name, product_quantity, product_price, product_discription } = req.body;
    console.log("new product-", old_name, product_img, product_name, product_quantity, product_price, product_discription);

    try {
        let products = [];
        if (fs.existsSync(filePathproduct)) {
            products = JSON.parse(fs.readFileSync(filePathproduct, "utf-8"));
        }

        const index = products.findIndex(product => product.product_name === old_name);
        if (index === -1) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Update the product
        products[index] = {
            product_img,
            product_name,
            product_quantity,
            product_price,
            product_discription,
        };

        fs.writeFileSync(filePathproduct, JSON.stringify(products, null, 3));
        res.status(200).json({ message: "Product updated successfully" });

    } catch (err) {
        res.status(500).json({ message: "Failed to update product" });
    }
});


// Get products data jo admin page sa data araha product.json ma
app.get("/api/products", (req, res) => {
    const products = JSON.parse(fs.readFileSync(filePathproduct));
    res.json(products);
});

// current user finding helpin user.json first index store
app.get("/api/current-user", (req, res) => {

 users = JSON.parse(fs.readFileSync(filePathuser, "utf-8"));
    const currentUser = users[0]; 
  
    res.json({ email: currentUser.currentemail });
});


// remove fromcart the product
const  CART_PATH = path.join(__dirname, "json", "usercart.json");

app.post("/remove-from-cart", (req, res) => {
    const { email, product_id } = req.body;

    fs.readFile( CART_PATH, "utf8", (err, data) => {
        let carts = {};
        if (!err && data) {
            carts = JSON.parse(data);
        }

        if (!carts[email]) return res.json({ success: false });

        carts[email] = carts[email].filter(p => p.product_id !== product_id);

        fs.writeFile( CART_PATH, JSON.stringify(carts, null, 2), (err) => {
            if (err) return res.json({ success: false });
            res.json({ success: true });
        });
    });
});

//current user  cart data read 
app.get("/get-cart", (req, res) => {
    const email = req.query.email;
    console.log("emial",email);
    fs.readFile( CART_PATH, "utf8", (err, data) => {
        let carts = {};
        if (!err && data) {
            carts = JSON.parse(data);
        }
        console.log("get cart front",carts);
        res.json({ [email]: carts[email] || [] });
    });
});

// user.html page add  to cart btn for store data  in json in file usercart.json and incrse decarse quanity for frontend
app.post("/add-to-cart", (req, res) => {
    const { email, product } = req.body;
    console.log("email", email);

    fs.readFile(CART_PATH, "utf8", (err, data) => {
        let carts = {};
        if (!err && data) {
            carts = JSON.parse(data);
        }

        if (!carts[email]) {
            carts[email] = [];
        }

        const index = carts[email].findIndex(p => p.product_name === product.product_name);

        if (index !== -1) {
            carts[email][index].quantity = product.quantity;
        } else {
            console.log("product::email", carts[email], product);
            carts[email].push(product);
        }

        fs.writeFile(CART_PATH, JSON.stringify(carts, null, 2), (err) => {
            if (err) {
                console.error("Failed to write file:", err);
                return res.json({ success: false });
            }
            res.json({ success: true });
        });
    });
});



const filePathcurrentcart = path.join(__dirname, "json", "usercart.json");

// cart data set for currentuser using current email
app.get("/api/userEmailcart", (req, res) => {
try {
    const users = JSON.parse(fs.readFileSync(filePathuser, "utf-8"));
    const currentUser = users[0]; // { currentemail: 'ujjwalsaini073@gmail.com' }

    const currentEmail = currentUser.currentemail; // 👈 Extract actual email
    console.log("current user:", currentEmail);

    const allCarts = JSON.parse(fs.readFileSync(filePathcurrentcart, "utf-8"));

    // Get the user's cart
    let userCart = [];

    if (currentEmail in allCarts) {
      userCart = allCarts[currentEmail];
      console.log("Cart mila:", userCart);
    } else {
      console.log("Cart empty hai ya user ka cart nahi hai");
    }

    res.json({ currentEmailcart: userCart });

  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});


// update  cart for like quantity decrse incrse 
app.post("/api/update-cart", (req, res) => {
    const { email, cart } = req.body;

    fs.readFile(filePathcurrentcart, "utf8", (err, data) => {
        let carts = {};
        if (!err && data) {
            try {
                carts = JSON.parse(data);
            } catch (parseError) {
                console.error("Failed to parse cart data:", parseError);
            }
        }

        // Update user's cart
        carts[email] = cart;

        fs.writeFile(filePathcurrentcart, JSON.stringify(carts, null, 2), (err) => {
            if (err) {
                console.error("Failed to save updated cart:", err);
                return res.status(500).json({ success: false });
            }
            res.json({ success: true });
        });
    });
});


app.listen(PORT, () => {
    console.log("running at port", PORT);
})