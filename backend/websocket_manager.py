"""
WebSocket Connection Manager for Real-time Admin Dashboard
"""
from typing import List, Dict, Any
import json
from fastapi import WebSocket
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"New WebSocket connection. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"WebSocket disconnected. Total: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send message to specific WebSocket connection"""
        try:
            await websocket.send_text(message)
        except Exception as e:
            print(f"Error sending personal message: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: str):
        """Broadcast message to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error broadcasting to connection: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

    async def send_user_update(self, data: Dict[str, Any]):
        """Send user data update to all connected admin clients"""
        message = json.dumps({
            "type": "user_update",
            "data": data,
            "timestamp": str(asyncio.get_event_loop().time())
        })
        await self.broadcast(message)

    async def send_stats_update(self, stats: Dict[str, Any]):
        """Send statistics update to all connected admin clients"""
        message = json.dumps({
            "type": "stats_update", 
            "data": stats,
            "timestamp": str(asyncio.get_event_loop().time())
        })
        await self.broadcast(message)

    async def send_detection_update(self, detection_data: Dict[str, Any]):
        """Send new detection update to all connected admin clients"""
        message = json.dumps({
            "type": "detection_update",
            "data": detection_data,
            "timestamp": str(asyncio.get_event_loop().time())
        })
        await self.broadcast(message)

# Global connection manager instance
manager = ConnectionManager()