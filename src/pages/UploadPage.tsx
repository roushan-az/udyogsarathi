// src/pages/UploadPage.tsx

import React from 'react';
import { Layout } from '../components/Layout';
import { UploadZone } from '../components/Uploadzone';


export const UploadPage: React.FC = () => {
  return (
    <Layout
      title="Upload Document"
      subtitle="Upload an image — FastAPI converts it to PDF, stores in Azure Blob, records in PostgreSQL"
    >
      <UploadZone />
    </Layout>
  );
};