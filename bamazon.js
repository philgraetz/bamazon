// Bamazon - object for accessing DB 'bamazon'
let mysql = require("mysql");
let chalk = require("chalk");

const DB_NAME = "bamazon";

function Bamazon() {
    this.connection = null;
    this.connected = false;     // Connected to DB

    // Set up parameters used for connecting to DB
    // (This must be done first)
    this.setConnectParams = function(params) {
        this.connectParams = params;
    };
    
    // ==================
    // End the connection
    // ==================
    this.end = function(callback) {
        this.connected = false;
        if (this.connection !== null) {
            console.log("Connection end");
            this.connection.end(callback);
            this.connection = null;
            this.connected = false;
            return;
        }
        console.log("Connection end - no connection");
        this.connection = null;
        this.connected = false;
        return;
    }

    // =======================
    // Connect to DB 'bamazon'
    // =======================
    this.connectToDB = function(callback) {
        // If we're already connected, return
        if (this.connected) {
            if (callback) {
                callback();
            }
            return;
        }
       
        // Since we're not connected, this should be null
        if (this.connection != null) {
            this.destroy();
            this.connection = null;
        }

        // Create connection object
        this.connection = mysql.createConnection({
            host     : this.connectParams.host,
            port     : this.connectParams.port,
            user     : this.connectParams.user,
            password : this.connectParams.password,
            database : DB_NAME,
        });
        
        // Connect
        this.connection.connect((err) => {
            if (err) {
                console.error("Error connecting: " + err.stack);
                this.end();
                return;
            }
            this.connected = true;
            if (callback)
                callback();
            return;
        });
    };

    // =====================================
    // Drop (if exists) and Create 'bamazon'
    // Assumes: not connected
    // Result:  Connected to 'bamazon'
    // =====================================
    this.dropAndCreateDB = function(callback) {
        // If we're already connected, return
        if (this.connected) {
            console.log("ERROR (dropAndCreateDB) already connected");
            return;
        }
       
        // Since we're not connected, this should be null
        if (this.connection != null) {
            this.destroy();
            this.connection = null;
        }

        // Create connection object
        // (Without 'database' param)
        this.connection = mysql.createConnection({
            host     : this.connectParams.host,
            port     : this.connectParams.port,
            user     : this.connectParams.user,
            password : this.connectParams.password,
        });
        
        // Connect
        this.connection.connect((err) => {
            if (err) {
                console.error("Error connecting: " + err.stack);
                this.end();
                return;
            }
            console.log('connected as id ' + this.connection.threadId);

            // Drop the DB (if it exists)
            this.connection.query("DROP DATABASE IF EXISTS bamazon", err => {
                if (err) {
                    console.error("Error dropping DB: " + err.stack);
                    this.end();
                    return;
                }
                console.log("Dropped DB bamazon (if it existed)");
        
                // Create the DB
                this.connection.query("CREATE DATABASE bamazon", err => {
                    if (err) {
                        console.error("Error creating DB: " + err.stack);
                        this.end();
                        return;
                    }
                    console.log("Created DB bamazon");
                    this.connection.changeUser({database: DB_NAME}, err => {
                        if (err) {
                            console.error("Error changing to " + DB_NAME + " " + err.stack);
                            return;
                        }
                        console.log("Changed to DB " + DB_NAME);
                        this.connected = true;
                        if (callback)
                            callback();
                    });
                });
            });
        });
    };

    // ==========================
    // Create the 'product' table
    // ==========================
    this.createProductsTable = function(callback) {
        if (!this.connected) {
            console.log("ERROR (createProductsTable) - not connected");
            return;
        }
        this.connection.query(
            "CREATE TABLE products(" +
                "item_id INTEGER NOT NULL AUTO_INCREMENT," +
                "product_name VARCHAR(30) NOT NULL," +
                "department_name VARCHAR(30) NOT NULL," +
                "price FLOAT(10,2) DEFAULT 0.0," +
                "stock_quantity INTEGER DEFAULT 0," +
                "PRIMARY KEY (item_id) )",
            (err) => {
                if (err) {
                    console.error("createProductsTable " + err.stack);
                    this.end();
                    return;
                }
                if (callback) {
                    callback();
                }
            }
        );
    };

    // =============================
    // Add a row to 'products' table
    // =============================
    this.addProduct = function(product, callback, callbackParam) {
        if (!this.connected) {
            console.log("ERROR (addProduct) - not connected");
            return;
        }
        this.connection.query(
            "INSERT INTO products SET ?", product,
            (err) => {
                if (err) {
                    console.error("addProducts " + err.stack);
                    this.end();
                    return;
                }
                if (callback) {
                    callback(callbackParam);
                }
            }
        );
    };

    // =================================
    // List everything in selected table
    // =================================
    this.listProducts = function(callback) {
        if (!this.connected) {
            console.log("ERROR (listProducts) - not connected");
            return;
        }
        this.connection.query(
            "select * FROM products",
            (err, results, fields) => {
                if (err) {
                    console.error("listProducts " + err.stack);
                    this.end();
                    return;
                }
                this.displayProducts("", results);
                if (callback) {
                    callback();
                }
            }
        );
    };

    // ================================
    // List products with low inventory 
    // ================================
    this.listLowInventory = function(callback) {
        if (!this.connected) {
            console.log("ERROR (listLowInventory) - not connected");
            return;
        }
        this.connection.query(
            "select * FROM products WHERE stock_quantity < 5",
            (err, results, fields) => {
                if (err) {
                    console.error("listProducts " + err.stack);
                    this.end();
                    return;
                }
                this.displayProducts("", results);
                if (callback) {
                    callback();
                }
            }
        );
    };

    // Function to display products
    this.displayProducts = function(prefix, results) {
        console.log(prefix);
        console.log(chalk.bold.underline("item_id  product_name          department_name      price  quantity "));
        for (let i = 0; i < results.length; i++) {
            let id = this.pad('R', results[i].item_id, 7);
            let pn = this.pad('L', results[i].product_name, 20);
            let dn = this.pad('L', results[i].department_name, 15);
            let pr = this.pad('R', results[i].price.toFixed(2), 10);
            let sn = this.pad('R', results[i].stock_quantity, 8);
            console.log(`${id}  ${pn}  ${dn} ${pr} ${sn} `);
        }
        console.log("");
    }

    // Function to pad for display
    this.pad = function(justify, s1, num) {
        let s2 = s1.toString();
        let p = s2.length < num ? " ".repeat(num-s2.length) : "";
        return (justify.toUpperCase() === 'R') ? p + s2 : s2 + p;
    }

    // =========================================
    // Return a selected row from selected table
    // =========================================
    this.getRow = function(table, column, value, callback) {
        let queryStr = 'SELECT * FROM ' + table + ' WHERE ' + column + ' = ' + value;
        this.connection.query(queryStr, function(err, results) {
            if (err) {
                console.error("ERROR (getRow) " + err.stack);
                this.end();
                return;
            }
            callback(results);
        });
    };

    // ================
    // Add to inventory
    // ================
    // ======================
    // Make a purchase
    // (quantity is negative)
    // ======================
    this.addToInventory = function(item_id, quantity, callback) {
        if (!this.connected) {
            console.log("ERROR (addToInventory) - not connected");
            return;
        }
        this.connection.query(
            "select * FROM products WHERE item_id = " + item_id,
            (err, results, fields) => {
                if (err) {
                    console.error("addToInventory " + err.stack);
                    this.end();
                    return;
                }

                // Display this only if manager is adding to inventory
                if (quantity > 0)
                    this.displayProducts("\n\n== WAS ==", results);

                let n = parseInt(results[0].stock_quantity) + parseInt(quantity);

                let queryStr = 'UPDATE products SET stock_quantity = ' + n +
                               ' WHERE item_id = ' + item_id;
                this.connection.query(queryStr, (err) => {
                    if (err) {
                        console.error("ERROR (addToInventory) " + err.stack);
                        this.end();
                        return;
                    }
                    this.connection.query(
                        "select * FROM products WHERE item_id = " + item_id,
                        (err, results, fields) => {
                            if (err) {
                                console.error("addToInventory " + err.stack);
                                this.end();
                                return;
                            }
                
                            // Display this only if manager is adding to inventory
                            if (quantity > 0)
                                this.displayProducts("\n\n== NOW ==", results);

                            if (callback)
                                callback();
                        });
                });
        });
    };
}


module.exports = Bamazon;