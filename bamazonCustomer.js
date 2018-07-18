let Bamazon = require("./bamazon");
let inquirer = require("inquirer");

const SEED_PRODUCTS = [
    {
        product_name   : "Network Camera",
        department_name: "Electronics",
        price          : 49.99,
        stock_quantity : 3
    },
    {
        product_name   : "Backpack",
        department_name: "Camping",
        price          : 85.00,
        stock_quantity : 8
    },
    {
        product_name   : "Lemon Jello",
        department_name: "Groceries",
        price          : 1.99,
        stock_quantity : 1000
    },
    {
        product_name   : "40 inch UHD TV",
        department_name: "electronics",
        price          : 299.99,
        stock_quantity : 10
    },
    {
        product_name   : "Paper towels 8 pack",
        department_name: "Groceries",
        price          : 12.99,
        stock_quantity : 4
    },
    {
        product_name   : "4 person tent",
        department_name: "Camping",
        price          : 249.99,
        stock_quantity : 10
    },
    {
        product_name   : "Turboforce Fan",
        department_name: "Appliances",
        price          : 15.00,
        stock_quantity : 12
    },
    {
        product_name   : "Deluxe SS toaster 4",
        department_name: "Appliances",
        price          : 39.99,
        stock_quantity : 5
    },
    {
        product_name   : "Mix-o-Master",
        department_name: "Appliances",
        price          : 89.99,
        stock_quantity : 10
    },
    {
        product_name   : "65 inch UHD TV",
        department_name: "Electronics",
        price          : 898.98,
        stock_quantity : 2
    },
];


// Create a 'bamazon' object
// Set up its connection params
let bamazon = new Bamazon();
bamazon.setConnectParams({
    host     : 'localhost',
    port     : 3306,
    user     : "root",
    password : "root",
});

// Startup - Do you need to create the database?
function startup() {
    inquirer.prompt({
        type   : 'confirm',
        name   : 'dropAndCreate',
        message: "Do you need to create 'bamazon' DB?",
        default: false
    }).then(answer => {
        if (answer.dropAndCreate) {
            // Create the DB.
            // When it is done, call populateProducts()
            bamazon.dropAndCreateDB(populateProducts); 
            return;
        }
        connectToDB();
    });
}

// Populate the products table
// When it is done, call addProducts()
function populateProducts() {
    console.log("populating 'products' table");
    bamazon.createProductsTable(addProduct);
}

// Add a number of rows to the products table
function addProduct(index) {
    if (index === undefined)
        index = 0;

    // Loop on this until we've gotten all SEED_PROCUCTS
    if (index < SEED_PRODUCTS.length) {
        let product = SEED_PRODUCTS[index];
        bamazon.addProduct(product, addProduct, index+1);
    } else {
        selectAction();
    }
}

// Connect to the DB
function connectToDB() {
    bamazon.connectToDB(selectAction);
}

// Select next action
function selectAction() {
    inquirer.prompt({
        type   : 'list',
        name   : 'action',
        message: "\nWhat to do next?",
        choices: ['List Products', 
                  'Buy Something', 
                  'Exit']
    }).then(answer => {
        if (answer.action === 'List Products') {
            listProducts();
        } else if (answer.action === 'Buy Something') {
            buyStuff();
        } else {
            bamazon.end();
        }
    });
}

// List Products
function listProducts() {
    bamazon.listProducts(selectAction);
}

// Buy Something
function buyStuff() {
    inquirer.prompt([
        {
            type   : 'input',
            name   : 'id',
            message: "Enter product item_id"
        },
        {
            type   : 'input',
            name   : 'quantity',
            message: "Enter number of units to buy"
        }
    ]).then((answers) => {
        bamazon.getRow('products', 'item_id', answers.id, function(results) {
            let stock_quantity = parseInt(results[0].stock_quantity);
            let quantity = parseInt(answers.quantity);
            let price = parseFloat(results[0].price);
            let cost = (price * quantity).toFixed(2);
            if (stock_quantity >= quantity) {
                console.log("\nYou are in luck. We have enough of that product");
                console.log("Your total cost will be $" + cost);
                inquirer.prompt(
                    {
                        type:'confirm', 
                        name:'ok', 
                        message:"Continue?",
                        default: false
                    }).then(confirm => {
                        if (confirm.ok) {
                            bamazon.addToInventory(answers.id, -quantity, function() {
                                    console.log("\nPurchase completed, total = $"+ cost);
                                    selectAction();
                                });
                            return;
                        } else {
                            console.log("Skipping purchase...");
                            selectAction();
                        }
                  });
            } else {
                console.log("I am sorry we do not have enough stock for that purchase");
                selectAction();
            }
        });
    });
}

// Start
startup();

