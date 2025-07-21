import pandas as pd
import random
import os

def generate_unique_phone_numbers(count):
    """Generate a list of unique 10-digit phone numbers"""
    phone_numbers = set()
    
    while len(phone_numbers) < count:
        # Generate a 10-digit phone number (starting with area codes 2-9)
        area_code = random.randint(200, 999)
        exchange = random.randint(200, 999)
        number = random.randint(1000, 9999)
        phone = f"{area_code}{exchange}{number}"
        phone_numbers.add(phone)
    
    return list(phone_numbers)

def add_phone_column_to_csv(csv_filename):
    """Read CSV file, add phone column with unique numbers, and save"""
    try:
        # Read the CSV file
        df = pd.read_csv(csv_filename)
        print(f"Successfully read {csv_filename}")
        print(f"Original shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        
        # Check if phone column already exists
        if 'phone' in df.columns:
            print("Phone column already exists. Replacing with new unique numbers...")
        
        # Generate unique phone numbers
        num_rows = len(df)
        phone_numbers = generate_unique_phone_numbers(num_rows)
        
        # Add phone column
        df['phone'] = phone_numbers
        
        # Save back to CSV
        output_filename = csv_filename.replace('.csv', '_with_phone.csv')
        df.to_csv(output_filename, index=False)
        
        print(f"Successfully added phone column with {num_rows} unique numbers")
        print(f"Saved to: {output_filename}")
        print(f"New shape: {df.shape}")
        print(f"Sample phone numbers: {phone_numbers[:5]}")
        
        return output_filename
        
    except FileNotFoundError:
        print(f"Error: File {csv_filename} not found")
        return None
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        return None

# Main execution
if __name__ == "__main__":
    # List available CSV files in the current directory
    csv_files = [f for f in os.listdir('.') if f.endswith('.csv')]
    
    if not csv_files:
        print("No CSV files found in current directory")
    else:
        print("Available CSV files:")
        for i, file in enumerate(csv_files, 1):
            print(f"{i}. {file}")
        
        # For this example, let's process students.csv
        # You can change this to any CSV file you want
        target_file = "teachers.csv"
        
        if target_file in csv_files:
            print(f"\nProcessing {target_file}...")
            result = add_phone_column_to_csv(target_file)
            if result:
                print(f"Task completed successfully!")
        else:
            print(f"File {target_file} not found. Available files: {csv_files}")