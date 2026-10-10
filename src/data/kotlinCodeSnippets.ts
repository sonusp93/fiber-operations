export interface KotlinFile {
  filename: string;
  category: string;
  description: string;
  code: string;
}

export const KOTLIN_PROJECT_FILES: KotlinFile[] = [
  {
    filename: 'MainActivity.kt',
    category: 'Activity & Navigation',
    description: 'Main Android entry point with Jetpack Compose, edge-to-edge system bars, and bottom floating pill bar.',
    code: `package com.vka.telecom.operations

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.vka.telecom.operations.ui.theme.TelecomDarkTheme
import com.vka.telecom.operations.ui.components.FloatingBottomPill
import com.vka.telecom.operations.ui.screens.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            TelecomDarkTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF090A0F)
                ) {
                    TelecomMainScaffold()
                }
            }
        }
    }
}

@Composable
fun TelecomMainScaffold() {
    var currentTab by remember { mutableStateOf("FAT") }
    var selectedFatId by remember { mutableStateOf<String?>(null) }
    var isSearchOpen by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize()) {
        // Content Area
        when {
            isSearchOpen -> {
                SearchScreen(
                    onClose = { isSearchOpen = false },
                    onSelectFat = { fatId ->
                        selectedFatId = fatId
                        isSearchOpen = false
                    }
                )
            }
            selectedFatId != null -> {
                FatDetailsScreen(
                    fatId = selectedFatId!!,
                    onBack = { selectedFatId = null }
                )
            }
            currentTab == "FAT" -> {
                DashboardScreen(
                    onOpenSearch = { isSearchOpen = true },
                    onSelectFat = { fatId -> selectedFatId = fatId }
                )
            }
            currentTab == "RSU" -> {
                RsuOperationsScreen()
            }
            currentTab == "HUB" -> {
                GisNetworkMapScreen(
                    onSelectNode = { fatId -> selectedFatId = fatId }
                )
            }
            currentTab == "PON" -> {
                NotesLogScreen()
            }
        }

        // Floating Frosted Glass Bottom Pill Navigation (as shown in video)
        FloatingBottomPill(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 32.dp),
            currentTab = currentTab,
            onTabSelected = { tab ->
                selectedFatId = null
                isSearchOpen = false
                currentTab = tab
            }
        )
    }
}
`
  },
  {
    filename: 'DashboardScreen.kt',
    category: 'UI Screens',
    description: 'Jetpack Compose dashboard screen with Total FATs, Unique ASUS/RSUs, sparkline area charts, and switch results.',
    code: `package com.vka.telecom.operations.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vka.telecom.operations.ui.components.SparklineAreaChart

@Composable
fun DashboardScreen(
    onOpenSearch: () -> Unit,
    onSelectFat: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(bottom = 120.dp)
    ) {
        // Top App Bar
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Dashboard",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = { /* Open notifications */ }) {
                        Icon(
                            imageVector = Icons.Default.Notifications,
                            contentDescription = "Notifications",
                            tint = Color.LightGray
                        )
                    }
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(18.dp))
                            .background(Color(0xFF222636)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("VK", color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }
        }

        // Search Bar Trigger
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF141722))
                    .clickable { onOpenSearch() }
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = "Search",
                    tint = Color(0xFF64748B)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Search for metrics / lookups...",
                    color = Color(0xFF64748B),
                    fontSize = 14.sp
                )
            }
            Spacer(modifier = Modifier.height(20.dp))
        }

        // Metric Card 1: TOTAL FATS
        item {
            MetricCard(
                title = "TOTAL FATS",
                value = "15.80",
                unit = "MFB",
                changeRate = "+6.45%",
                isPositive = true,
                chartColor = Color(0xFF06B6D4)
            )
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Metric Card 2: UNIQUE ASUS / RSUs
        item {
            MetricCard(
                title = "UNIQUE ASUS",
                value = "2277",
                unit = "MTm",
                changeRate = "+0.92%",
                isPositive = true,
                chartColor = Color(0xFFF59E0B)
            )
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Metric Card 3: TOTAL HUBS
        item {
            MetricCard(
                title = "TOTAL HUBS",
                value = "11.74",
                unit = "HUB",
                changeRate = "0.00%",
                isPositive = true,
                chartColor = Color(0xFF3B82F6)
            )
            Spacer(modifier = Modifier.height(24.dp))
        }

        // Network Operations Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Network Operations",
                    color = Color.White,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 16.sp
                )
                Text(
                    text = "See All",
                    color = Color(0xFF38BDF8),
                    fontSize = 13.sp
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Sample Switch Results
        items(listOf("ASU Thalium COMM", "VKA FAT ASUS", "VKA RSU Realtime")) { item ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF141722))
                    .clickable { onSelectFat("fat-01") }
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(item, color = Color.White, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                    Text("3:30 PM · Splice Node", color = Color(0xFF64748B), fontSize = 12.sp)
                }
                Text("50 MB", color = Color(0xFF10B981), fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    unit: String,
    changeRate: String,
    isPositive: Boolean,
    chartColor: Color
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color(0xFF12141D))
            .padding(18.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = title,
                color = Color(0xFF94A3B8),
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
            Text(
                text = changeRate,
                color = if (isPositive) Color(0xFF10B981) else Color(0xFFEF4444),
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Row(verticalAlignment = Alignment.Bottom) {
            Text(
                text = value,
                color = Color.White,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = unit,
                color = Color(0xFF64748B),
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(bottom = 4.dp)
            )
        }
        Spacer(modifier = Modifier.height(14.dp))
        // Canvas glowing sparkline area chart
        SparklineAreaChart(
            modifier = Modifier
                .fillMaxWidth()
                .height(60.dp),
            lineColor = chartColor
        )
    }
}
`
  },
  {
    filename: 'FatDetailsScreen.kt',
    category: 'UI Screens',
    description: 'Kotlin Jetpack Compose screen showing the exact FAT Details specification table seen in the video.',
    code: `package com.vka.telecom.operations.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun FatDetailsScreen(
    fatId: String,
    onBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(horizontal = 16.dp)
    ) {
        // Back Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = Color(0xFFF59E0B)
                )
            }
            Text(
                text = "Back",
                color = Color(0xFFF59E0B),
                fontWeight = FontWeight.Medium,
                fontSize = 16.sp
            )
        }

        Text(
            text = "FAT Details",
            fontSize = 26.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // Details Specifications Table (Matching Video 1 & 4)
        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFF12141D))
                .padding(16.dp),
            contentPadding = PaddingValues(bottom = 100.dp)
        ) {
            val specs = listOf(
                "Total Name" to "15.00 MFB",
                "FAT ID" to "DKA039631",
                "Current RSUs" to "0.0 FK",
                "WPW Type" to "0.00/2024 Seed",
                "Total Parameter" to "0.004M",
                "Splice Type" to "YH HB",
                "Security Hash" to "001404",
                "Pole Unit" to "VHN POLE",
                "Coordinates" to "80.1387 / 10.0234",
                "Total Connection" to "Concrete / Fiber G.652D",
                "Network Address" to "4.35 MB",
                "Content Address" to "11.74 HUB",
                "Status" to "Now Working"
            )

            items(specs.size) { index ->
                val (label, value) = specs[index]
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = label,
                        color = Color(0xFF94A3B8),
                        fontSize = 13.sp
                    )
                    Text(
                        text = value,
                        color = if (label == "Status") Color(0xFF10B981) else Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                if (index < specs.size - 1) {
                    HorizontalDivider(color = Color(0xFF1E2230), thickness = 1.dp)
                }
            }
        }
    }
}
`
  },
  {
    filename: 'GisNetworkMap.kt',
    category: 'GIS & Maps',
    description: 'Dark-themed vector telecom GIS map in Compose with glowing fiber trunk routes and distance callouts.',
    code: `package com.vka.telecom.operations.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp

@Composable
fun GisNetworkMapScreen(
    onSelectNode: (String) -> Unit
) {
    var scale by remember { mutableFloatStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0B0D14))
            .pointerInput(Unit) {
                detectTransformGestures { _, pan, zoom, _ ->
                    scale = (scale * zoom).coerceIn(0.5f, 3.0f)
                    offset += pan
                }
            }
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            // Render Dark Map Roads & Grid
            // Render Optical Fiber Trunk Lines with Cyan Glow
            val fiberPath = Path().apply {
                moveTo(240f * scale + offset.x, 90f * scale + offset.y)
                lineTo(240f * scale + offset.x, 160f * scale + offset.y)
                lineTo(210f * scale + offset.x, 220f * scale + offset.y)
                lineTo(190f * scale + offset.x, 290f * scale + offset.y)
            }
            
            // Outer glow
            drawPath(
                path = fiberPath,
                color = Color(0x3306B6D4),
                style = Stroke(width = 12f * scale, cap = StrokeCap.Round)
            )
            // Core fiber conduit
            drawPath(
                path = fiberPath,
                color = Color(0xFF38BDF8),
                style = Stroke(width = 3.5f * scale, cap = StrokeCap.Round)
            )

            // Render Terminals (FAT / RSU nodes)
            drawCircle(
                color = Color(0xFF06B6D4),
                radius = 8f * scale,
                center = Offset(190f * scale + offset.x, 290f * scale + offset.y)
            )
        }
    }
}
`
  },
  {
    filename: 'RsuOperationsScreen.kt',
    category: 'Hardware Operations',
    description: 'Hardware switches and operational toggles (Open FAT, FAT RSU, RSU Downs, Down Repaired) matching video 1 & 4.',
    code: `package com.vka.telecom.operations.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class SwitchState(val id: String, val title: String, val defaultActive: Boolean)

@Composable
fun RsuOperationsScreen() {
    var switches by remember {
        mutableStateOf(
            listOf(
                SwitchState("1", "Open FAT", true),
                SwitchState("2", "FAT RSU", true),
                SwitchState("3", "RSU Downs", false),
                SwitchState("4", "Down Repaired", true),
                SwitchState("5", "BYAH FATS", true),
                SwitchState("6", "Connector", true),
                SwitchState("7", "Cap Distance", false)
            )
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(horizontal = 16.dp)
    ) {
        Text(
            text = "RSU Operations",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(vertical = 16.dp)
        )

        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0xFF12141D))
                .padding(16.dp),
            contentPadding = PaddingValues(bottom = 120.dp)
        ) {
            items(switches) { item ->
                var isChecked by remember { mutableStateOf(item.defaultActive) }
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = item.title,
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Switch(
                        checked = isChecked,
                        onCheckedChange = { isChecked = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = Color(0xFF10B981),
                            uncheckedThumbColor = Color(0xFF94A3B8),
                            uncheckedTrackColor = Color(0xFF222636)
                        )
                    )
                }
                HorizontalDivider(color = Color(0xFF1E2230), thickness = 1.dp)
            }
        }
    }
}
`
  },
  {
    filename: 'FloatingBottomPill.kt',
    category: 'Custom UI Components',
    description: 'The signature floating frosted glass pill navigation with FAT, RSU, HUB, PON PORT, and Settings tabs.',
    code: `package com.vka.telecom.operations.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun FloatingBottomPill(
    modifier: Modifier = Modifier,
    currentTab: String,
    onTabSelected: (String) -> Unit
) {
    val tabs = listOf("FAT", "RSU", "HUB", "PON", "Settings")

    Box(
        modifier = modifier
            .shadow(elevation = 24.dp, shape = RoundedCornerShape(32.dp), spotColor = Color(0x66000000))
            .clip(RoundedCornerShape(32.dp))
            .background(Color(0xD9161821))
            .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(32.dp))
            .padding(horizontal = 8.dp, vertical = 6.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            tabs.forEach { tab ->
                val isSelected = currentTab == tab
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(24.dp))
                        .background(if (isSelected) Color(0xFF242838) else Color.Transparent)
                        .clickable { onTabSelected(tab) }
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = tab,
                        color = if (isSelected) Color.White else Color(0xFF94A3B8),
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}
`
  }
];
