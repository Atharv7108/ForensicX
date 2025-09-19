#!/usr/bin/env python3
"""
Convert ForensicX SQLite database to MySQL format for XAMPP visualization
"""
import sqlite3
import json
from datetime import datetime

def export_to_mysql_dump():
    """Export SQLite data to MySQL dump format"""
    try:
        # Connect to SQLite database
        conn = sqlite3.connect('forensicx.db')
        cursor = conn.cursor()
        
        # Create MySQL dump file
        with open('forensicx_mysql_dump.sql', 'w') as f:
            f.write("-- ForensicX Database MySQL Dump\n")
            f.write("-- Generated on: {}\n\n".format(datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
            
            # Create database
            f.write("CREATE DATABASE IF NOT EXISTS `forensicx` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n")
            f.write("USE `forensicx`;\n\n")
            
            # Create users table
            f.write("-- Table structure for table `users`\n")
            f.write("DROP TABLE IF EXISTS `users`;\n")
            f.write("""CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_superuser` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `total_detections` int(11) DEFAULT 0,
  `monthly_detections` int(11) DEFAULT 0,
  `plan_type` varchar(50) DEFAULT 'free',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n""")
            
            # Export users data
            cursor.execute("SELECT * FROM users")
            users = cursor.fetchall()
            
            if users:
                f.write("-- Dumping data for table `users`\n")
                f.write("INSERT INTO `users` (`id`, `email`, `username`, `full_name`, `hashed_password`, `is_active`, `is_superuser`, `created_at`, `updated_at`, `total_detections`, `monthly_detections`, `plan_type`) VALUES\n")
                
                for i, user in enumerate(users):
                    # Escape single quotes
                    user_data = tuple(str(field).replace("'", "\\'") if field is not None else 'NULL' for field in user)
                    values = "('{}', '{}', '{}', {}, '{}', {}, {}, '{}', '{}', {}, {}, '{}')".format(
                        user_data[0], user_data[1], user_data[2], 
                        f"'{user_data[3]}'" if user_data[3] != 'NULL' else 'NULL',
                        user_data[4], user_data[5], user_data[6], user_data[7], user_data[8],
                        user_data[9], user_data[10], user_data[11]
                    )
                    
                    if i < len(users) - 1:
                        f.write(values + ",\n")
                    else:
                        f.write(values + ";\n\n")
            
            # Create detection_history table
            f.write("-- Table structure for table `detection_history`\n")
            f.write("DROP TABLE IF EXISTS `detection_history`;\n")
            f.write("""CREATE TABLE `detection_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `detection_type` varchar(50) NOT NULL,
  `content_hash` varchar(255) NOT NULL,
  `result` text NOT NULL,
  `confidence` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n""")
            
            # Export detection_history data
            cursor.execute("SELECT * FROM detection_history")
            detections = cursor.fetchall()
            
            if detections:
                f.write("-- Dumping data for table `detection_history`\n")
                f.write("INSERT INTO `detection_history` (`id`, `user_id`, `detection_type`, `content_hash`, `result`, `confidence`, `created_at`) VALUES\n")
                
                for i, detection in enumerate(detections):
                    detection_data = tuple(str(field).replace("'", "\\'") if field is not None else 'NULL' for field in detection)
                    values = "('{}', '{}', '{}', '{}', '{}', {}, '{}')".format(
                        detection_data[0], detection_data[1], detection_data[2], 
                        detection_data[3], detection_data[4],
                        f"'{detection_data[5]}'" if detection_data[5] != 'NULL' else 'NULL',
                        detection_data[6]
                    )
                    
                    if i < len(detections) - 1:
                        f.write(values + ",\n")
                    else:
                        f.write(values + ";\n\n")
            else:
                f.write("-- No data found in detection_history table\n\n")
            
            # Create api_keys table
            f.write("-- Table structure for table `api_keys`\n")
            f.write("DROP TABLE IF EXISTS `api_keys`;\n")
            f.write("""CREATE TABLE `api_keys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `key_name` varchar(255) NOT NULL,
  `key_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_used` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n""")
            
            # Export api_keys data
            cursor.execute("SELECT * FROM api_keys")
            api_keys = cursor.fetchall()
            
            if api_keys:
                f.write("-- Dumping data for table `api_keys`\n")
                for api_key in api_keys:
                    f.write(f"INSERT INTO `api_keys` VALUES {api_key};\n")
            else:
                f.write("-- No data found in api_keys table\n\n")
        
        conn.close()
        print("✅ MySQL dump created successfully: forensicx_mysql_dump.sql")
        print("📋 Instructions:")
        print("1. Start XAMPP and open phpMyAdmin")
        print("2. Create a new database called 'forensicx'")
        print("3. Import the file: forensicx_mysql_dump.sql")
        print("4. You can now visualize your data in phpMyAdmin!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def export_to_csv():
    """Export data to CSV files for Excel/Google Sheets"""
    import csv
    
    try:
        conn = sqlite3.connect('forensicx.db')
        cursor = conn.cursor()
        
        # Export users to CSV
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        
        # Get column names
        cursor.execute("PRAGMA table_info(users)")
        user_columns = [column[1] for column in cursor.fetchall()]
        
        with open('users_export.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(user_columns)
            writer.writerows(users)
        
        # Export detection_history to CSV
        cursor.execute("SELECT * FROM detection_history")
        detections = cursor.fetchall()
        
        cursor.execute("PRAGMA table_info(detection_history)")
        detection_columns = [column[1] for column in cursor.fetchall()]
        
        with open('detection_history_export.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(detection_columns)
            writer.writerows(detections)
        
        conn.close()
        
        print("✅ CSV files created successfully:")
        print("📊 users_export.csv")
        print("📊 detection_history_export.csv")
        print("💡 You can open these in Excel, Google Sheets, or any CSV viewer")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    import sys
    
    print("🗄️  ForensicX Database Export Tool")
    print("=" * 50)
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "mysql":
            export_to_mysql_dump()
        elif sys.argv[1] == "csv":
            export_to_csv()
        else:
            print("Usage:")
            print("  python3 export_db.py mysql    # Export to MySQL dump for XAMPP")
            print("  python3 export_db.py csv      # Export to CSV files for Excel")
    else:
        print("Choose export format:")
        print("1. MySQL dump (for XAMPP/phpMyAdmin)")
        print("2. CSV files (for Excel/Google Sheets)")
        choice = input("Enter choice (1 or 2): ")
        
        if choice == "1":
            export_to_mysql_dump()
        elif choice == "2":
            export_to_csv()
        else:
            print("Invalid choice")