# Cyber Threat Detector

A full-stack cyber intrusion detection system that applies machine learning to classify network traffic as **normal or malicious** using the NSL-KDD dataset. The project is designed to mirror a production-style architecture, with a modular backend API, a modern web frontend, and flexible input modes for both guided analysis and bulk evaluation.

---

## 🚀 Overview

The Cyber Threat Detector enables users to analyze network traffic in near real time by submitting individual feature values or uploading CSV files containing multiple network records. The system preprocesses network features, performs ML-based inference, and surfaces high-risk traffic patterns through an interactive dashboard.

This project emphasizes **software engineering principles** such as clean API design, modularity, and extensibility, alongside applied machine learning.

---

## 🧠 Key Features

* **ML-based Intrusion Detection**  
  Trained machine learning models on the NSL-KDD dataset to classify network connections as benign or malicious.

* **Dual Input Modes**

  * *Simple Mode*: Form-based input for guided, single-record analysis  
  * *Advanced Mode*: CSV upload for batch evaluation of multiple network records

* **Modular Backend Architecture**  
  FastAPI-based backend responsible for feature preprocessing, model inference, and REST API exposure.

* **Interactive Frontend**  
  Next.js frontend that consumes backend APIs and provides a clean, responsive interface for analysis and results visualization.

* **Configurable Alerting**  
  Threshold-based classification logic to surface high-risk traffic patterns while reducing false positives.

---

## 🏗️ System Architecture

Next.js Frontend  
↓  
REST API (FastAPI)  
↓  
Feature Preprocessing & Validation  
↓  
ML Model Inference (scikit-learn)  
↓  
Prediction & Risk Classification


---

## 🛠️ Tech Stack

### Backend

* Python
* FastAPI
* scikit-learn
* NSL-KDD Dataset
* Docker

### Frontend

* Next.js
* React
* TypeScript

### Tooling

* Git / GitHub

---

## 📊 Dataset

The project uses the **NSL-KDD** dataset, a refined version of the KDD Cup 1999 dataset, commonly used for benchmarking network intrusion detection systems. It contains labeled network traffic records with 40+ features describing protocol behavior, connection statistics, and traffic patterns.

---

## 🔌 API Capabilities

The backend exposes RESTful endpoints that support:

* Single-record prediction via JSON payloads (`/api/detect`)  
* Batch prediction via CSV file upload (`/api/detect_csv`)  
* Input validation and feature normalization

These APIs are designed to be easily extended to support additional models or input formats.

---

## 🌐 Live Deployment

* **Frontend (Vercel)**: [https://cyber-threat-detector-iota.vercel.app/](https://cyber-threat-detector-iota.vercel.app/)  
  - Publicly accessible; anyone with the link can view and interact with the interface.

* **Backend API (Render)**: [https://cyber-threat-detector-api-50ps.onrender.com/](https://cyber-threat-detector-api-50ps.onrender.com/)  
  - Supports REST endpoints for single and batch prediction.  
  - ⚠️ Currently public with no authentication, so API calls can be made by anyone who knows the URL.

---


## 🐳 Deployment

The backend is containerized using Docker to ensure consistent runtime behavior across environments. This allows the application to be deployed and run with minimal setup while keeping model dependencies isolated.

---

## 📈 Future Improvements

* Add support for additional intrusion detection datasets
* Introduce real-time traffic simulation
* Implement role-based access control
* Expand model explainability and visualization

---

## 🎯 Motivation

This project was built to deepen understanding of:

* Applied machine learning in security contexts
* Full-stack system design
* Backend API development for ML inference
* Building production-style projects beyond academic demos

---

