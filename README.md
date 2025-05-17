# Stateful Local Agent - An Academic Assistant

A powerful research lab management system that helps you track papers, manage lab members, and get paper recommendations. Built with Python and modern web technologies.

## 🌟 Features

- 📚 **Research Lab Management**
  - Create and manage research labs
  - Add lab members and their Google Scholar profiles
  - Track research areas and interests
  - Collect papers automatically from members' profiles

- 📝 **Paper Management**
  - Automatic paper collection from Google Scholar
  - Store paper metadata and PDFs
  - Track paper citations and updates
  - Get personalized paper recommendations

- 🌐 **Web Interface**
  - Beautiful, modern UI
  - Real-time updates
  - Easy paper browsing and management
  - Interactive chat interface

## 🚀 Quick Start Guide

### 1. Set Up Your Environment

First, make sure you have Python 3.11 or higher installed! Then follow these steps:

```bash
# After clone the project, create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Your Environment

Create a `.env` file in the project root folder with your settings:

```env
# Required: OpenAI API key for AI features
OPENAI_API_KEY=your_openai_key

# Database paths (you can keep these defaults)
CHROMA_PERSIST_DIRECTORY=./chroma_langchain_db
SQLITE_DB_PATH=./sqlite_langchain_db.db
DEFAULT_DATA_DIR=./data

# Optional: Set your preferred embedding model
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
```

### 3. Run the Application

The system provides two ways to interact: web interface and terminal mode. Let's start with the web interface:

```bash
# Start the web server
python app.py
```

Then open your browser and go to `http://localhost:5000`

### 4. Step-by-Step Usage Guide

#### Creating Your First Lab

1. Start the application:
   ```bash
   python app.py
   ```

2. In the web interface, use the chat to create a lab:
   ```
   Create a lab called vision_research_lab at UC Berkeley with Jitendra Malik as leader
   ```

3. Add lab members:
   ```
   Add member Haozhi Qi with Google Scholar URL https://scholar.google.com/citations?user=iyVHKkcAAAAJ to vision_research_lab
   ```

4. Define research areas:
   ```
   Add research areas: computer vision, machine learning, robotics to vision_research_lab
   ```

#### Collecting Papers

1. Collect papers from lab members:
   ```
   Collect papers from vision_research_lab members
   ```

2. View collected papers:
   - Go to the "Lab Papers" section in the web interface
   - You'll see papers listed with titles, authors, abstracts, and links
   - Use the refresh button to update the list

#### Getting Recommendations

1. Request paper recommendations:
   ```
   Recommend papers for vision_research_lab based on their research areas
   ```

2. View recommendations:
   - Check the "Recommended Papers" section
   - Papers are sorted by relevance to your lab's interests
   - Click on paper titles to view details

## 📁 Project Structure

```
local_agent/
├── app.py                 # Main application file
├── data/                 # Data storage
│   ├── labs.db          # SQLite database
│   └── papers/          # PDF storage
├── templates/           # Web interface templates
├── static/             # Static files (CSS, JS)
└── requirements.txt    # Python dependencies
```

## 💡 Key Components

- `app.py`: The main application file that handles:
  - Web server setup
  - Database connections
  - API endpoints
  - Paper collection logic
  - Lab management

- `labs.db`: SQLite database storing:
  - Lab information
  - Member details
  - Research areas
  - Paper metadata

- `chroma_langchain_db/`: Vector database for:
  - Paper embeddings
  - Semantic search
  - Recommendation engine

## 🔧 Troubleshooting

### Common Issues

1. **Database Errors**
   ```
   Error: No such table: labs
   ```
   Solution: The database hasn't been initialized. Run:
   ```bash
   python app.py --init-db
   ```

2. **Paper Collection Issues**
   ```
   Error: Could not fetch papers from Google Scholar
   ```
   Solution: Check your internet connection and try again in a few minutes (Google Scholar has rate limits)

3. **OpenAI API Errors**
   ```
   Error: Invalid API key
   ```
   Solution: Check your `.env` file and ensure `OPENAI_API_KEY` is set correctly

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [Google Scholar Documentation](https://scholar.google.com/intl/en/scholar/about.html)

## 🤝 Need Help?

- Create an issue for bugs or feature requests

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.