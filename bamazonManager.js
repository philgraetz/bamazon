let Bamazon = require("./bamazon");
let inquirer = require("inquirer");

// Create a 'bamazon' object
// Set up its connection params
let bamazon = new Bamazon();
bamazon.setConnectParams({
    host     : 'localhost',
    port     : 3306,
    user     : "root",
    password : "root",
});

// Startup
function startup() {
    bamazon.connectToDB(selectAction);
}

// Select next action
function selectAction() {
    inquirer.prompt({
        type   : 'list',
        name   : 'action',
        message: "\nWhat to do next?",
        choices: ['View Products For Sale', 
                  'View Low Inventory', 
                  'Add to Inventory',
                  'Add New Product',
                  'Exit']
    }).then(answer => {
        if (answer.action === 'View Products For Sale') {
            viewProducts();
        } else if (answer.action === 'View Low Inventory') {
            viewLowInventory();
        } else if (answer.action === 'Add to Inventory') {
            addToInventory();
        } else if (answer.action === 'Add New Product') {
            addNewProduct();
        } else {
            bamazon.end();
        }
    });
}

// View Products For Sale
function viewProducts() {
    bamazon.listProducts(selectAction);
}

// View Low Inventory
function viewLowInventory() {
    bamazon.listLowInventory(selectAction);
}

// Add to Inventory
function addToInventory() {
    inquirer.prompt([
        {
            type   : 'input',
            name   : 'id',
            message: "Enter product item_id"
        },
        {
            type   : 'input',
            name   : 'quantity',
            message: "Enter number of units to add"
        }
    ]).then((answers) => {
        bamazon.addToInventory(answers.id, answers.quantity, selectAction);
    });
}

// Add New Product
function addNewProduct() {
    inquirer.prompt([
        {
            type   : 'input',
            name   : 'product_name',
            message: "Enter product_name"
        },
        {
            type   : 'input',
            name   : 'department_name',
            message: "Enter department_name"
        },
        {
            type   : 'input',
            name   : 'price',
            message: "Enter price",
            validate: function(value) {
                return !isNaN(value) || 'Please enter a valid price';
            }
        },
        {
            type   : 'input',
            name   : 'quantity',
            message: "Enter quantity",
            validate: function(value) {
                // Valid if no non-digit is found.
                let patt = /[^0-9]/ // Look for anything not a digit
                let valid = !patt.test(value);
                return valid || 'Please enter only digits';
            }
        },
    ]).then((answers) => {
        let product = {
            product_name   : answers.product_name,
            department_name: answers.department_name,
            price          : answers.price,
            stock_quantity : answers.quantity
        };
        bamazon.addProduct(product, selectAction);
    });
}

// Call startup
startup();