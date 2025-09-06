import React from 'react';
import styled from 'styled-components';

const CommunityContainer = styled.div`
  padding: 2rem;
  color: white;
`;

const CommunityIssues: React.FC = () => {
  return (
    <CommunityContainer>
      <h1>Community Issues - Coming Soon</h1>
      <p>This section is being developed with Reddit-style community features.</p>
    </CommunityContainer>
  );
};

export default CommunityIssues;
