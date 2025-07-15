# Medical Image Search Platform

A full-stack application for medical professionals to search and manage X-ray scan datasets used in AI model development.

## 🚀 Live Demo

- **Frontend**: [Coming Soon - Will be deployed on Vercel]
- **Backend API**: [Coming Soon - Will be deployed on Render]
- **Admin Panel**: [Backend URL]/admin

## ✨ Features

- 🔍 **Advanced Search**: Elasticsearch-powered search with fuzzy matching and relevance scoring
- 📱 **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- 🖼️ **Image Management**: Upload, view, and manage X-ray images with metadata
- 📊 **Statistics Dashboard**: Real-time analytics and body part distribution
- 🏥 **Medical Data**: Comprehensive metadata including diagnosis, institution, tags
- ⚡ **Performance**: Sub-100ms search times with React Query caching
- 👨‍⚽ **Admin Interface**: Enhanced Django admin for data management

## 🛠️ Tech Stack

**Backend:**
- Django 4.2+ with REST Framework
- Elasticsearch for advanced search
- SQLite (development) / PostgreSQL (production)
- Pillow for image handling

**Frontend:**
- React 18+ with TypeScript
- Styled Components for responsive design
- React Query for state management
- Axios for API communication

## 📦 Project Structure

```
medproject/
├── backend/                 # Django backend
│   ├── medproject/         # Django project settings
│   ├── xray_search/        # Main app with models, views, serializers
│   ├── media/              # Uploaded X-ray images
│   ├── requirements.txt    # Python dependencies
│   └── manage.py          # Django management
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── styles/        # Theme and global styles
│   ├── public/
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/[YOUR_USERNAME]/medical-image-search.git
   cd medical-image-search
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   .\venv\Scripts\Activate.ps1
   # Linux/Mac
   source venv/bin/activate
   
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py seed_data --count 20
   python manage.py runserver
   ```

3. **Frontend Setup** (new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

### Optional: Elasticsearch Setup

For advanced search features:

1. Download Elasticsearch 7.17.x
2. Start Elasticsearch service
3. Run: `python setup_elasticsearch.py`

## 📖 API Documentation

### Core Endpoints

- `GET /api/xrays/` - List all X-ray scans with filtering
- `POST /api/xrays/` - Upload new X-ray scan
- `GET /api/xrays/{id}/` - Get specific X-ray details
- `GET /api/xrays/stats/` - Get dashboard statistics
- `GET /api/search/?q=query` - Elasticsearch search

### Example API Usage

```bash
# Search X-rays
curl "http://localhost:8000/api/xrays/?search=pneumonia"

# Filter by body part
curl "http://localhost:8000/api/xrays/?body_part=Chest"

# Get statistics
curl "http://localhost:8000/api/xrays/stats/"
```

## 🗃️ Sample Data Structure

```json
{
  "id": 1,
  "patient_id": "P00128",
  "image_url": "http://localhost:8000/media/xrays/chest_001.jpg",
  "body_part": "Chest",
  "scan_date": "2024-09-21",
  "institution": "Mayo Clinic",
  "description": "Patient shows signs of pneumonia in the lower left lobe.",
  "diagnosis": "Pneumonia",
  "tags": ["lung", "infection", "opacity"],
  "created_at": "2024-01-15T10:30:00Z"
}
```

## 🔍 Search Features

- **Full-text search** across descriptions, diagnoses, and tags
- **Filter by body part**, institution, diagnosis, date ranges
- **Elasticsearch integration** with fuzzy matching and relevance scoring
- **Real-time suggestions** and autocomplete
- **Performance metrics** showing search time

## 📱 Mobile Support

Fully responsive design supporting:
- 📱 Mobile phones (320px+)
- 📋 Tablets (768px+)
- 🖥️ Desktop (1024px+)

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Render)
- Push to GitHub
- Connect to Render
- Auto-deploy from main branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Medical imaging datasets from public research repositories
- Django and React communities for excellent documentation
- Elasticsearch for powerful search capabilities

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the API documentation
- Review the setup guides

---

**Built for medical professionals by developers who care about healthcare technology.** 🏥✨ 