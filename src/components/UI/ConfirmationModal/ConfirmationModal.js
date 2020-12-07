import React from 'react';

import './ConfirmationModal.css';

const ConfirmationModal = React.memo((props) => {
  const { onContinue, onCancel } = props;
  return (
    <React.Fragment>
      <div className='backdrop' onClick={props.onClose} />
      <div className='confirmation-modal'>
        <h2>Delete Ingredient?</h2>
        <p>Press Okay To Delete</p>
        <div className='confirmation-modal__actions'>
          <button type='button' onClick={onCancel}>
            Cancel
          </button>
          <button type='button' onClick={onContinue}>
            Okay
          </button>
        </div>
      </div>
    </React.Fragment>
  );
});

export default ConfirmationModal;
