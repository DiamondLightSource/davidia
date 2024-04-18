import React, { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const MySwaggerDocs: React.FC = () => {
  const [openApiSpec, setOpenApiSpec] = useState<object | null>(null);

  useEffect(() => {
    fetch('../storybook-static/openapi.json')
      .then((response) => response.json())
      .then((data: object | null) => {
        setOpenApiSpec(data);
      })
      .catch((error) => {
        console.error('Error fetching openapi.json:', error);
      });
  }, []);

  if (!openApiSpec) {
    return <div>Loading...</div>;
  }

  return <SwaggerUI spec={openApiSpec} />;
};

export default MySwaggerDocs;
