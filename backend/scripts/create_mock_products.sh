#!/bin/bash

# Script to create 50 mock products for the Order Management System
# Run this script after starting the application on port 9242

BASE_URL="http://localhost:9242/api/products"
LOGIN_URL="http://localhost:9242/api/auth/login"
EMAIL="admin@orderflow.com"
PASSWORD="admin123"

# Function to get JWT token
get_jwt_token() {
    login_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
        "$LOGIN_URL")
    
    # Extract access token using grep and sed
    access_token=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | sed 's/"accessToken":"\(.*\)"/\1/')
    echo "$access_token"
}

# Array of product names
declare -a products=(
    "Laptop Pro 16"
    "Wireless Mouse"
    "Mechanical Keyboard"
    "USB-C Hub"
    "External Monitor 27in"
    "Smartphone Case"
    "Bluetooth Headphones"
    "Portable Charger"
    "Standing Desk"
    "Ergonomic Chair"
    "Coffee Mug"
    "Notebook Set"
    "Pen Collection"
    "Desk Lamp LED"
    "Plant Pot Small"
    "Water Bottle"
    "Backpack Canvas"
    "Tablet Stand"
    "Cable Organizer"
    "Webcam HD"
    "Microphone USB"
    "Book Programming"
    "Sticker Pack"
    "Phone Grip"
    "Screen Cleaner"
    "Mousepad Large"
    "Speaker Bluetooth"
    "Fitness Tracker"
    "Gaming Controller"
    "Hard Drive External"
    "Memory Card 64GB"
    "Router WiFi 6"
    "Ethernet Cable 5m"
    "Printer Wireless"
    "Scanner Portable"
    "Projector Mini"
    "Smart Watch"
    "Earbuds Wireless"
    "Camera Action"
    "Tripod Compact"
    "Lens Cleaning Kit"
    "Power Strip Smart"
    "Light Strip RGB"
    "Alarm Clock Digital"
    "Calculator Scientific"
    "Whiteboard Small"
    "Marker Set"
    "Sticky Notes"
    "File Organizer"
    "Desk Mat XXL",
    "ladle",
    "bag of popcorn",
    "handbasket",
    "pair of glasses",
    "chalk",
    "sticker book",
    "can of whipped cream",
    "jar of pickles",
    "toy robot",
    "music CD",
    "plush rabbit",
    "pair of dice",
    "pepper shaker",
    "tennis racket",
    "tennis ball",
    "knife",
    "pair of water goggles",
    "lotion",
    "dagger",
    "washing machine",
    "spool of wire",
    "clay pot",
    "butter knife",
    "squirt gun",
    "sun glasses",
    "tissue box",
    "container of pudding",
    "spool of string",
    "purse/bag",
    "blowdryer",
    "fork",
    "white out",
    "rock",
    "comb",
    "pinecone",
    "banana",
    "floor",
    "shawl",
    "tea pot",
    "lace",
    "flag",
    "scarf",
    "baseball",
    "hand bag",
    "wallet",
    "whip",
    "candy bar",
    "game cartridge",
    "laser pointer",
    "toe ring",
    "snail shell",
    "shirt button",
    "rock",
    "turtle",
    "comb",
    "towel",
    "pants",
    "mirror",
    "box of baking soda",
    "speakers",
    "pearl necklace",
    "pair of knitting needles",
    "shawl",
    "remote",
    "bow",
    "jar of jam",
    "cellphone",
    "wrench",
    "socks",
    "radio",
    "ipod charger",
    "ring",
    "spice bottle",
    "pair of earrings",
    "cars",
    "lace",
    "broccoli",
    "canvas",
    "quartz crystal",
    "coffee pot",
    "bottle of honey",
    "trucks",
    "flowers",
    "brush",
    "pair of scissors",
    "plush dog",
    "candy cane",
    "pasta strainer",
    "trucks",
    "pool stick",
    "pearl necklace",
    "plush octopus",
    "model car",
    "toothpaste",
    "magnifying glass",
    "scotch tape",
    "lotion",
    "rubber stamp",
    "slipper"
)

echo "Creating 50 mock products..."
echo "Make sure the application is running on $BASE_URL"
echo ""

# Login and get JWT token
echo "🔐 Logging in as $EMAIL..."
JWT_TOKEN=$(get_jwt_token)

if [ -z "$JWT_TOKEN" ]; then
    echo "❌ Failed to obtain JWT token. Please check login credentials and server status."
    exit 1
fi

echo "✅ Login successful! Token: ${JWT_TOKEN:0:20}..."
echo ""

for i in "${!products[@]}"; do
    product_name="${products[$i]}"
    
    # Generate random price between 10.00 and 999.99
    price=$(awk 'BEGIN{printf "%.2f", 10 + rand() * 990}')
    
    # Generate random stock between 1 and 100
    stock=$((RANDOM % 100 + 1))
    
    # Create JSON payload
    json_payload="{\"name\":\"$product_name\",\"price\":$price,\"stock\":$stock}"
    
    # Send POST request with JWT Authorization header
    response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -d "$json_payload" \
        "$BASE_URL")
    
    # Extract HTTP status code (last 3 characters)
    http_code="${response: -3}"
    
    if [ "$http_code" = "201" ]; then
        printf "✅ Created: %-25s Price: $%-8s Stock: %-3d\n" "$product_name" "$price" "$stock"
    else
        printf "❌ Failed: %-25s HTTP: %s\n" "$product_name" "$http_code"
    fi
    
    # Small delay to avoid overwhelming the server
    sleep 0.1
done

echo ""
echo "✅ Finished creating mock products!"
echo "You can view all products at: GET $BASE_URL"
echo "Remember to include: Authorization: Bearer <your-jwt-token>"