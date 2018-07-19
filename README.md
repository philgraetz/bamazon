# bamazon
node CLI programs that use mySQL. There are two programs:
- bamazonCustomer - CLI for viewing and buying items
- bamazonManager - CLI to manage inventory

The programs connect to a mySQL database and read and update entries in the database. There is the option to have the program create the 'bamazon' database and populate it with seed data. Or, the database can be created with a .sql file through mySQL Workbench or something similar. (.sql file is not provided here. Use the option in the program instead if you need seed data.)

## Instructions
You must be able to connect to a running mySQL server.

### bamazonCustomer
To start the program enter:

<code>node bamazonCustomer</code>

On startup the program will list the default connection parameters and ask:

<pre>Do you need to change these parameters? (y/N)</pre>

Default answer is 'No'. If you need to change them, enter 'y'. You will then be prompted for 'host', 'port', 'user', and 'password'.

Next you will be asked:

<pre>Do you need to create 'bamazon' DB? (y/N)</pre>

If this is the first time running the program, answer 'y'. This will create a dabase named 'bamazon', connect to it, create a 'products' table and seed it with some test data.

This will take you to the main menu:

<pre>
What to do next? (Use arrow keys)
> List Products
  Buy Something
  Exit
</pre>
Use the up/down arrow keys to make a selection and hit ENTER. You will want to 'List Products' first so you know what you can buy and what the item_id is for each product.

From here, follow the prompts. It should be intuitive enough.

### bamazonManager
To start the program enter:

<code>node bamazonManager</code>

On startup the program will list the default connection parameters and ask:

<pre>Do you need to change these parameters? (y/N)</pre>

Default answer is 'No'. If you need to change them, enter 'y'. You will then be prompted for 'host', 'port', 'user', and 'password'.

Next you will see the main menu:

<pre>
What to do next? (Use arrow keys)
> View Products For Sale
  View Low Inventory
  Add to Inventory
  Add New Product
  Exit
</pre>
Use the up/down arrow keys to make a selection and hit ENTER. 

From here, follow the prompts. It should be intuitive enough.