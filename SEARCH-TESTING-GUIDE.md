# 🔍 Search Functionality Testing Guide

## 🎯 How to Test the Search Button

### **Open the Generated HTML File**
1. Open `AreaMap-Generated.html` in your browser
2. Open browser Developer Tools (F12)
3. Go to the **Console** tab to see debug messages

### **Expected Console Output on Page Load:**
```
🚀 AreaMap initializing...
🎯 Setting up SVG interactions...
Found 24 interactive paths
🏢 Initializing EPC client dropdown...
📊 Processing 10 personnel records for EPC clients
👤 Processing person 6: Jennifer Chen
  📍 Primary areas: ["EPC-Microsoft","EPC-Amazon"]
    🎯 EPC code found: EPC-Microsoft → Microsoft
    🎯 EPC code found: EPC-Amazon → Amazon
🎉 Found EPC clients: ["Amazon","Google","Government","IBM","Microsoft","Oracle","Tesla"]
✅ Initialized 7 EPC clients from area codes
✅ AreaMap initialization complete
```

## 🧪 Testing Each Search Type

### **STEP-BY-STEP TEST PROCEDURE:**

### **1. Regional Search (Default)**
- **Step 1:** Open `AreaMap-Generated.html` in browser
- **Step 2:** Open Developer Tools (F12) → Console tab  
- **Step 3:** Ensure "Regional Search" radio button is selected (default)
- **Step 4:** In Region dropdown, select "East"
- **Step 5:** Click "🔍 Search Personnel" button
- **Expected Console Output:**
  ```
  🔍 performQuery called
  🎯 Search type selected: regional
  📍 Calling performRegionalQuery
  📍 performRegionalQuery started
  📊 Regional query inputs: {region: "East", area: "", coverageType: "all"}
  ✅ Validation passed, finding matching personnel...
  🎯 Found 3 matching personnel: ["John Smith", "Mike Wilson", "Maria Garcia"]
  🚀 Calling showPersonnelModal...
  📋 showPersonnelModal called: {title: "East", summary: "3 personnel found", resultCount: 3}
  ```
- **Expected Result:** Modal slides in from right with 3 personnel cards
- **Debug:** Look for console messages starting with "📍 Calling performRegionalQuery"

### **2. EPC Client Search**
- **Setup:** Click "EPC Client Search" radio button
- **Interface Change:** Client dropdown should appear with 7 clients
- **Test 1:** Select "Microsoft" → Click "🏢 Search EPC Personnel" 
- **Expected:** Modal shows Jennifer Chen (primary) and Thomas Anderson (secondary)
- **Debug:** Look for console messages starting with "🏢 Calling performEPCQuery"

### **3. Individual User Search**
- **Setup:** Click "Individual User" radio button
- **Interface Change:** Search input and user dropdown appear
- **Test 1:** Type "jennifer" in search box
- **Expected:** Dropdown populates with "Jennifer Chen (jennifer.chen@company.com)"
- **Test 2:** Select user → Click "👤 Find User"
- **Expected:** Modal shows Jennifer Chen's full profile
- **Debug:** Look for console messages starting with "👤 Calling performUserQuery"

## 🚨 Troubleshooting

### **Fixed Issues:**

#### **✅ Profile Image Loading Error (RESOLVED)**
- **Error:** `GET https://via.placeholder.com/50 net::ERR_NAME_NOT_RESOLVED`
- **Fix:** Replaced external placeholder with embedded SVG data URI
- **Result:** No more external network dependencies for profile images

### **If Search Button Doesn't Work:**

1. **Check Console for Errors:**
   - Look for red error messages
   - Common issue: JavaScript syntax errors

2. **Verify Button Click:**
   - Should see: `🔍 performQuery called`
   - If missing: Button onclick handler not working

3. **Check Search Type Detection:**
   - Should see: `🎯 Search type selected: regional/epc/user`
   - If missing: Radio button selection issue

4. **Verify Validation:**
   - Regional: Must select a region
   - EPC: Must select a client
   - User: Must select a user from dropdown

### **Common Issues:**

#### **Regional Search "Please select at least a Region" Alert**
- **Cause:** No region selected
- **Fix:** Select "East", "Central", or "West" from dropdown

#### **EPC Search "Please select a Client" Alert**
- **Cause:** No client selected
- **Fix:** Check if client dropdown populated (should show 7 clients)
- **Debug:** Look for EPC client initialization messages

#### **User Search "Please search for and select a user" Alert**
- **Cause:** No user selected from dropdown
- **Fix:** Type in search box, then select from dropdown results

#### **Modal Doesn't Open**
- **Cause:** `showPersonnelModal` function error
- **Debug:** Check console for modal-related errors

## 📊 Expected Test Data Results

### **Regional Search Results:**
- **East Region:** John Smith (A01, A02), Mike Wilson (A08), Maria Garcia (A05 secondary)
- **Central Region:** Emily Davis (B05, B06), Thomas Anderson (B03 primary), Lisa Wang (B07 secondary)
- **West Region:** Sarah Johnson (C01, C02, C08), David Rodriguez (C05, C06, C07), Alex Kumar (C01 primary)

### **EPC Client Search Results:**
- **Microsoft:** Jennifer Chen (primary), Thomas Anderson (secondary)
- **Amazon:** Jennifer Chen (primary), Alex Kumar (secondary)
- **Google:** Jennifer Chen (secondary), Lisa Wang (primary)
- **Tesla:** Thomas Anderson (primary), Alex Kumar (secondary)
- **IBM:** Maria Garcia (primary), Lisa Wang (secondary)
- **Oracle:** Maria Garcia (primary)
- **Government:** Alex Kumar (primary)

### **User Search Results:**
- **"jennifer":** Jennifer Chen
- **"anderson":** Thomas Anderson
- **"garcia":** Maria Garcia
- **"@company.com":** All 10 users

## 🔧 Developer Debug Commands

### **Test EPC Detection in Console:**
```javascript
// Test regional vs EPC code detection
console.log('A01 is EPC:', isEPCCode('A01')); // false
console.log('EPC-Microsoft is EPC:', isEPCCode('EPC-Microsoft')); // true

// Test client name extraction
console.log('EPC-Microsoft =>', extractClientNameFromCode('EPC-Microsoft')); // "Microsoft"
console.log('CLIENT-Google =>', extractClientNameFromCode('CLIENT-Google')); // "Google"
```

### **Test Search Functions Manually:**
```javascript
// Test regional search
performRegionalQuery();

// Test EPC search (after selecting client)
performEPCQuery();

// Test user search (after selecting user)
performUserQuery();
```

### **Inspect Personnel Data:**
```javascript
// View all personnel data
console.table(personnelData);

// View EPC personnel only
personnelData.filter(p => 
  (p.PrimaryAreaIDs || []).some(id => isEPCCode(id)) || 
  (p.SecondaryAreaIDs || []).some(id => isEPCCode(id))
);
```

## ✅ Success Indicators

- **Page Load:** Console shows initialization messages without errors
- **EPC Dropdown:** Shows 7 clients (Amazon, Google, Government, IBM, Microsoft, Oracle, Tesla)
- **Search Works:** All three search types open modal with correct results
- **Modal Display:** Shows proper separation of regional areas vs EPC clients
- **User Search:** Type-ahead works with live dropdown population

If you see all these indicators, the search functionality is working correctly!