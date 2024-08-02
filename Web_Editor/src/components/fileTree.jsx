import React from 'react';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';

const FileTree = ({ structure, openFile, createFolder, createFile, deleteItem }) => {
  const [selectedPath, setSelectedPath] = React.useState(null);

  const handleDelete = (node) => {
    const confirmDelete = window.confirm(`Are you sure? You want to delete ${node.name}?`);
    if (confirmDelete) {
      deleteItem(node.path);
    }
  };

  const renderTree = (node) => (
    <div 
      key={node.path} 
      style={{ marginLeft: node.type === 'folder' ? 20 : 40, position: 'relative'}}
    >
      <span 
        style={{ cursor: 'pointer', color: node.type === 'file' ? 'blue' : 'black' }}
        onClick={() => {
          if (node.type === 'folder') {
            setSelectedPath(selectedPath === node.path ? null : node.path);
          } else {
            openFile(node.path);
          }
        }}
      >
        {node.name}
      </span>

      {node.type === 'folder' && selectedPath === node.path && (
        <div style={{ marginTop: 5 }}>
          <span onClick={() => createFolder(node.path)}><CreateNewFolderIcon/></span>
          <span onClick={() => createFile(node.path)}><NoteAddIcon/></span>
          <span onClick={() => handleDelete(node)}><DeleteForeverRoundedIcon/></span>
        </div>
      )}

      {node.children && node.children.map(child => renderTree(child))}
    </div>
  );

  return <div>{structure.map(node => renderTree(node))}</div>;
};

export default FileTree;
