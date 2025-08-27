"""Database connection and configuration module."""

import os
from typing import Optional
from sqlalchemy import create_engine, Engine
from sqlalchemy.engine import URL
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DatabaseConfig:
    """Database configuration and connection management."""
    
    def __init__(self):
        self.supabase_engine: Optional[Engine] = None
        self.prod_engine: Optional[Engine] = None
    
    def get_supabase_engine(self) -> Engine:
        """Get or create Supabase database engine."""
        if self.supabase_engine is None:
            supabase_url = URL.create(
                drivername="postgresql",
                username="postgres",
                password="KD7gQE$5Z&L5iJh4",
                host="db.fqvijojeqecksexlayuv.supabase.co",
                port=5432,
                database="postgres",
            )
            self.supabase_engine = create_engine(supabase_url)
        return self.supabase_engine
    
    def get_prod_engine(self) -> Engine:
        """Get or create production database engine."""
        if self.prod_engine is None:
            prod_url = URL.create(
                drivername="postgresql",
                username="postgres",
                password="bOEYkCRR4fZH/u)b",
                host="34.90.136.135",
                port=5432,
                database="prod",
            )
            self.prod_engine = create_engine(prod_url)
        return self.prod_engine
    
    def close_connections(self):
        """Close all database connections."""
        if self.supabase_engine:
            self.supabase_engine.dispose()
        if self.prod_engine:
            self.prod_engine.dispose()

# Global database config instance
db_config = DatabaseConfig()