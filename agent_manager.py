from pathlib import Path
import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Import core functionality from stateful-agent
from stateful_agent.paper_recommendation_agent import PaperRecommendationAgent
from stateful_agent.linkedin_agent import LinkedInAgent
from stateful_agent.tools.sqlite import SQLiteDB
from stateful_agent.tools.chromadb import ChromaDB

class AgentManager:
    def __init__(self):
        load_dotenv()
        
        # Initialize databases
        self.sqlite_db = SQLiteDB(os.getenv('SQLITE_DB_PATH', 'sqlite_langchain_db.db'))
        self.chroma_db = ChromaDB(os.getenv('CHROMA_PERSIST_DIRECTORY', 'chroma_langchain_db'))
        
        # Initialize agents
        self.paper_agent = PaperRecommendationAgent(
            sqlite_db=self.sqlite_db,
            chroma_db=self.chroma_db
        )
        
        self.linkedin_agent = LinkedInAgent(
            sqlite_db=self.sqlite_db,
            chroma_db=self.chroma_db
        )
        
        # Ensure data directories exist
        Path('data/recommendation').mkdir(parents=True, exist_ok=True)

    def process_message(self, message: str) -> str:
        """Process a chat message and return the agent's response."""
        # First try to identify if this is a LinkedIn-specific request
        if any(keyword in message.lower() for keyword in ['linkedin', 'post', 'share']):
            return self.linkedin_agent.process_message(message)
        
        # Default to paper recommendation agent
        return self.paper_agent.process_message(message)

    def get_labs(self) -> List[Dict[str, Any]]:
        """Get all research labs."""
        return self.paper_agent.get_labs()

    def get_papers(self, lab_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get papers, optionally filtered by lab."""
        return self.paper_agent.get_papers(lab_name)

    def create_lab(self, name: str, institution: str, leader: str) -> Dict[str, Any]:
        """Create a new research lab."""
        return self.paper_agent.create_lab(name, institution, leader)

    def add_lab_member(self, lab_name: str, member_name: str, scholar_url: str) -> Dict[str, Any]:
        """Add a member to a research lab."""
        return self.paper_agent.add_lab_member(lab_name, member_name, scholar_url)

    def collect_papers(self, lab_name: str) -> List[Dict[str, Any]]:
        """Collect papers from lab members."""
        return self.paper_agent.collect_papers(lab_name)

    def recommend_papers(self, lab_name: str, days: int = 30, limit: int = 5) -> List[Dict[str, Any]]:
        """Get paper recommendations for a lab."""
        return self.paper_agent.recommend_papers(lab_name, days, limit)

    def post_to_linkedin(self, content: str, paper_url: Optional[str] = None) -> Dict[str, Any]:
        """Post content to LinkedIn."""
        return self.linkedin_agent.post_to_linkedin(content, paper_url)

# Create a singleton instance
agent_manager = AgentManager() 