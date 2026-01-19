#!/usr/bin/env python3
import os
import shutil

# Source and destination
src = '/home/iteck/Dev_Projects/fin_teck/apps/web/public/We Make It Possible_01.png'
dst = '/home/iteck/Dev_Projects/fin_teck/apps/web/public/iteck-logo.png'

# Check if source exists
if os.path.exists(src):
    # Rename/move the file
    shutil.move(src, dst)
    print("✅ Logo renamed successfully!")
    print(f"New location: {dst}")
else:
    print(f"❌ Source file not found: {src}")

# Verify the new file exists
if os.path.exists(dst):
    print("✅ Logo file is ready!")
else:
    print("❌ Something went wrong")
