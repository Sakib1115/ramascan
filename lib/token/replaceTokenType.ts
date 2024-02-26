import type { TokenType } from 'types/api/token';

function replaceTokenType(type: TokenType): TokenType {
  const mapping: Record<string, TokenType> = {
    'ERC-20': 'RAMA-20',
    'ERC-721': 'RAMA-721',
    'ERC-1155': 'RAMA-1155',
    'RAMA-20': 'ERC-20',
    'RAMA-721': 'ERC-721',
    'RAMA-1155': 'ERC-1155',
    // Add more mappings as needed
  };

  return mapping[type] || type;
}

export default replaceTokenType;
