import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Terminal } from 'lucide-react';

export const KotlinNavigationCode: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const kotlinSource = `package com.vka.telecom.navigation

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.*

// 1. Data Model representing each FAT record from the spreadsheet
data class FatRecord(
    val id: String,
    val city: String,
    val rsu: String,
    val rsuLat: Double,
    val rsuLog: Double,
    val hub: String,
    val hubLat: Double,
    val hubLog: Double,
    val fatId: String,
    val fatLat: Double,
    val fatLog: Double,
    val affiliatedPon: String,
    val ponPort: String,
    val rfsDate: String,
    val totalCap: Int,
    val neAddress: String,
    val locality: String
)

// 2. Geodesic distance calculation in meters (Haversine formula)
fun calculateDistanceMeters(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Int {
    val r = 6371000.0 // Earth radius in meters
    val dLat = Math.toRadians(lat2 - lat1)
    val dLon = Math.toRadians(lon2 - lon1)
    val a = sin(dLat / 2).pow(2) +
            cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
            sin(dLon / 2).pow(2)
    val c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return (r * c).roundToInt()
}

// 3. Launch Google Maps Navigation Intent directly to the target FAT box
fun launchGoogleMapsNavigation(context: Context, fatLat: Double, fatLog: Double) {
    val gmmIntentUri = Uri.parse("google.navigation:q=$fatLat,$fatLog&mode=d")
    val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri).apply {
        setPackage("com.google.android.apps.maps")
    }
    if (mapIntent.resolveActivity(context.packageManager) != null) {
        context.startActivity(mapIntent)
    } else {
        // Fallback to web browser Google Maps
        val webUri = Uri.parse("https://www.google.com/maps/dir/?api=1&destination=$fatLat,$fatLog")
        context.startActivity(Intent(Intent.ACTION_VIEW, webUri))
    }
}

// 4. Main Android Activity
class FieldNavigationActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF090C14)
                ) {
                    FieldNavigationApp()
                }
            }
        }
    }
}

@Composable
fun FieldNavigationApp() {
    val context = LocalContext.current
    var searchQuery by remember { mutableStateOf("") }
    var selectedFat by remember { mutableStateOf<FatRecord?>(null) }

    // Sample dataset from spreadsheet
    val fatList = remember {
        listOf(
            FatRecord("1", "Calicut", "08N", 11.29881, 75.79203, "08N07", 11.30752, 75.78499, "08N070101", 11.30738, 75.78451, "08N070101", "08N-A2/1/1", "1/20/2023", 16, "KRISHNAN", "Kozhikode"),
            FatRecord("5", "Cochin", "01I", 10.2024, 76.3832, "01I04", 10.20936, 76.38461, "01I040207", 10.20954, 76.38471, "01I040207", "01I-Z1/3/9", "7/6/2023", 16, "7th Floor, Angamaly", "Angamaly"),
            FatRecord("21", "Cochin", "0C0", 10.01163, 76.36748, "0C002", 10.00425, 76.37566, "0C0020101", 10.00416, 76.37575, "0C0020101", "0CO-H1/0/6", "6/30/2018", 8, "9TH FLOOR kochi", "Kochi"),
            FatRecord("28", "Cochin", "0I5", 9.961502, 76.3398, "0I502", 9.962971, 76.33895, "0I5020104", 9.963514, 76.33875, "0I5020104", "0I5-A1/1/2", "3/15/2023", 8, "PRA 54, Er Thrippunithura", "Thrippunithura"),
            FatRecord("49", "Thiruvananthapuram", "0CI", 8.49178, 76.9248, "0CI04", 8.489305, 76.92852, "0CI040208", 8.488647, 76.92769, "0CI040208", "0CI-H1/0/1", "2/10/2023", 16, "S2-8, Man Pettah", "Pettah")
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(16.dp)
    ) {
        // App Header
        Text(
            text = "Field Location Navigation System",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
        Text(
            text = "RSU, HUB, FAT Box & PON Port GIS Routing",
            fontSize = 12.sp,
            color = Color(0xFF94A3B8)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Search Box
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search FAT ID, PON Port, Locality...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = Color.Gray) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // FAT Directory List
        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(fatList) { fat ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .clickable { selectedFat = fat },
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF141824))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "FAT: \${fat.fatId}",
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF38BDF8)
                            )
                            Text(
                                text = "Port: \${fat.ponPort}",
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF34D399)
                            )
                        }
                        Text(
                            text = "\${fat.neAddress} (\${fat.locality})",
                            color = Color.White,
                            fontSize = 14.sp
                        )
                        Text(
                            text = "HUB: \${fat.hub} · RSU: \${fat.rsu} · Cap: \${fat.totalCap}P",
                            color = Color(0xFF94A3B8),
                            fontSize = 11.sp
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Button(
                            onClick = { launchGoogleMapsNavigation(context, fat.fatLat, fat.fatLog) },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF06B6D4))
                        ) {
                            Icon(Icons.Default.Navigation, contentDescription = "Navigate", tint = Color.Black)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Navigate to FAT Box", color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(kotlinSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([kotlinSource], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'FieldNavigationActivity.kt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 p-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">
            Kotlin Android App Architecture
          </h1>
          <p className="text-[11px] text-neutral-400">
            Native Jetpack Compose + GPS Navigation for Field Employees
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-800/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-900/60 cursor-pointer min-h-[38px]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Kotlin'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-200 hover:text-white cursor-pointer"
            title="Download .kt File"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto w-full">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-cyan-500/20 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-white">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>Field Employee Mobile Specification</span>
          </div>
          <p className="text-neutral-400 leading-relaxed font-sans">
            This Kotlin code integrates Google Maps turn-by-turn Navigation Intent, Haversine geodesic calculations, and the exact FAT / RSU / HUB / PON Port dataset from your spreadsheet for Android field tablets and smartphones.
          </p>
        </div>

        <div className="rounded-2xl bg-[#080b12] border border-neutral-800 overflow-hidden shadow-2xl">
          <div className="px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-300 font-bold">FieldNavigationActivity.kt</span>
            <span className="text-neutral-500">Android SDK 34 / Jetpack Compose</span>
          </div>
          <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed max-h-[520px]">
            <code>{kotlinSource}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
