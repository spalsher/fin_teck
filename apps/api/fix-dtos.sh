#!/bin/bash

# This script adds validation decorator imports to all controller files that have DTOs
# Run from apps/api directory

files=(
  "src/modules/finance/controllers/bill.controller.ts"
  "src/modules/finance/controllers/invoice.controller.ts"
  "src/modules/finance/controllers/receipt.controller.ts"
  "src/modules/finance/controllers/bank-account.controller.ts"
  "src/modules/finance/controllers/chart-of-account.controller.ts"
  "src/modules/finance/controllers/journal-entry.controller.ts"
  "src/modules/hrms/controllers/employee.controller.ts"
  "src/modules/hrms/controllers/payroll.controller.ts"
  "src/modules/asset/controllers/asset.controller.ts"
  "src/modules/scm/controllers/item.controller.ts"
  "src/modules/scm/controllers/warehouse.controller.ts"
  "src/modules/scm/controllers/purchase-order.controller.ts"
  "src/modules/manufacturing/controllers/bom.controller.ts"
  "src/modules/manufacturing/controllers/production-order.controller.ts"
)

for file in "${files[@]}"; do
  echo "Processing $file..."
  
  # Check if file already has class-validator import
  if ! grep -q "from 'class-validator'" "$file"; then
    # Find the line with @nestjs/swagger import
    line_num=$(grep -n "from '@nestjs/swagger'" "$file" | head -1 | cut -d: -f1)
    
    if [ -n "$line_num" ]; then
      # Add the import after the swagger import
      sed -i "${line_num}a import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsObject, IsDate, IsEnum } from 'class-validator';" "$file"
      echo "  ✓ Added class-validator import"
    fi
  else
    echo "  ⊘ Already has class-validator import"
  fi
done

echo "Done! Now you need to manually add decorators to each DTO property."
