"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#faf9f7',
      color: '#2d2d2d',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        
        {/* Header */}
        <header style={{
          paddingTop: '4rem',
          paddingBottom: '4rem',
          textAlign: 'center',
          borderBottom: '1px solid #ede9e3'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '300',
            letterSpacing: '-0.02em',
            margin: '0',
            marginBottom: '1rem'
          }}>
            OKOA
          </h1>
          <p style={{
            fontSize: '1.25rem',
            fontWeight: '400',
            color: '#4a4a4a',
            margin: '0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Institutional-grade document processing with multi-agent AI analysis
          </p>
        </header>

        {/* Featured Deal */}
        <section style={{
          padding: '4rem 0',
          borderBottom: '1px solid #ede9e3'
        }}>
          <div style={{
            backgroundColor: '#f5f4f2',
            border: '1px solid #ede9e3',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '400',
              margin: '0',
              marginBottom: '1rem'
            }}>
              Wolfgramm Ascent Waldorf Deal
            </h2>
            <p style={{
              color: '#6b6b6b',
              margin: '0',
              marginBottom: '2rem'
            }}>
              Park City hospitality development • $43.8M valuation • AI analysis ready
            </p>
            <Link 
              href="/deals/k576qtmmvp4594zdvqp3qttx0d7np0m1"
              style={{
                display: 'inline-block',
                backgroundColor: '#8b4513',
                color: 'white',
                padding: '0.75rem 2rem',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#6d3410';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#8b4513';
              }}
            >
              Analyze Deal →
            </Link>
          </div>
        </section>

        {/* Main Actions */}
        <section style={{ padding: '4rem 0' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              backgroundColor: '#f5f4f2',
              border: '1px solid #ede9e3',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '400',
                margin: '0',
                marginBottom: '1rem'
              }}>
                Create Folder
              </h3>
              <p style={{
                color: '#6b6b6b',
                margin: '0',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                Create a new folder in Box.com for document storage and processing
              </p>
              <button
                onClick={() => setShowCreateFolder(true)}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#8b4513',
                  padding: '0.75rem 2rem',
                  border: '2px solid #8b4513',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#8b4513';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#8b4513';
                }}
              >
                Create New Folder
              </button>
            </div>

            <div style={{
              backgroundColor: '#f5f4f2',
              border: '1px solid #ede9e3',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '400',
                margin: '0',
                marginBottom: '1rem'
              }}>
                Manage Folders
              </h3>
              <p style={{
                color: '#6b6b6b',
                margin: '0',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                View existing folders and upload documents for processing
              </p>
              <Link 
                href="/folders"
                style={{
                  display: 'block',
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#8b4513',
                  padding: '0.75rem 2rem',
                  border: '2px solid #8b4513',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#8b4513';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#8b4513';
                }}
              >
                View All Folders
              </Link>
            </div>
          </div>
        </section>

        {/* Integration Guide */}
        <section style={{
          padding: '4rem 0',
          borderTop: '1px solid #ede9e3'
        }}>
          <div style={{
            backgroundColor: '#f5f4f2',
            border: '1px solid #ede9e3',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '400',
              margin: '0',
              marginBottom: '1rem'
            }}>
              Integration Guide
            </h2>
            <p style={{
              color: '#6b6b6b',
              margin: '0',
              marginBottom: '2rem'
            }}>
              Connect Fireflies.ai, Slack, and Box.com with step-by-step setup instructions
            </p>
            <Link 
              href="/integrations"
              style={{
                display: 'inline-block',
                backgroundColor: 'transparent',
                color: '#8b4513',
                padding: '0.75rem 2rem',
                border: '2px solid #8b4513',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#8b4513';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#8b4513';
              }}
            >
              View Setup Guide →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          padding: '2rem 0',
          textAlign: 'center',
          borderTop: '1px solid #ede9e3',
          marginTop: '4rem'
        }}>
          <p style={{
            color: '#8b8680',
            margin: '0',
            fontSize: '0.875rem'
          }}>
            OKOA Capital LLC • 2025 • Enhanced Edition
          </p>
        </footer>
      </div>
    </div>
  );
}