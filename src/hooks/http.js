import { useReducer, useCallback } from 'react';

const initialState = {
  loading: false,
  error: null,
  data: null,
  extra: null,
  identifier: null,
};

const httpReducer = (curHttpState, action) => {
  switch (action.type) {
    case 'SEND':
      return {
        loading: true,
        error: null,
        data: null,
        extra: null,
        identifier: action.identifier,
      };
    case 'RESPONSE':
      return {
        ...curHttpState,
        loading: false,
        data: action.resData,
        extra: action.extra,
      };
    case 'ERROR':
      return { loading: false, error: action.errorMessage };
    case 'CLEAR':
      return initialState;
    default:
      throw new Error('BRO TF??');
  }
};

const useHttp = () => {
  const [httpState, dispatchHttp] = useReducer(httpReducer, initialState);

  const clear = useCallback(() => dispatchHttp({ type: 'CLEAR' }), []);

  const sendRequest = useCallback(
    (url, method, body, reqExtra, reqIdentifier) => {
      dispatchHttp({ type: 'SEND', identifier: reqIdentifier });
      fetch(url, {
        method: method,
        body: body,
        header: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => {
          return res.json();
        })
        .then((resData) => {
          dispatchHttp({ type: 'RESPONSE', resData: resData, extra: reqExtra });
        })
        .catch((err) => {
          dispatchHttp({ type: 'ERROR', errorMessage: 'SOMETHING WENT WRONG' });
        });
    },
    []
  );

  return {
    isLoading: httpState.loading,
    data: httpState.data,
    error: httpState.error,
    sendRequest: sendRequest,
    reqExtra: httpState.extra,
    reqIdentifier: httpState.identifier,
    clear: clear,
  };
};

export default useHttp;

// Add Ingredient

// dispatchHttp({ type: 'SEND' });
// fetch(
//   'https://hooks-intro-51b69-default-rtdb.firebaseio.com/ingredients.json',
//   {
//     method: 'POST',
//     body: JSON.stringify(ingredient),
//     headers: { 'Content-Type': 'application/json' },
//   }
// )
//   .then((res) => {
//     dispatchHttp({ type: 'RESPONSE' });
//     return res.json();
//   })
//   .then((resData) => {
//     dispatch({
//       type: ReducerTypes.add,
//       ingredient: { id: resData.name, ...ingredient },
//     });
//   });

// Delete Ingredient

// dispatchHttp({ type: 'SEND' });
// fetch(
//   `https://hooks-intro-51b69-default-rtdb.firebaseio.com/ingredients/${userIngredients[activeIngredientIndex].id}.json`,
//   {
//     //idk what this is doing
//     method: ReducerTypes.delete,
//   }
// )
//   .then((res) => {
//     dispatchHttp({ type: 'RESPONSE' });
//     // setUserIngredients((prevIngredients) =>
//     //   prevIngredients.filter((ingredient) => ingredient.id !== index)
//     // );
//     dispatch({
//       type: ReducerTypes.delete,
//       id: userIngredients[activeIngredientIndex].id,
//     });
//     setShowModal(false);
//   })
//   .catch((err) => {
//     dispatchHttp({ type: 'ERROR', errorMessage: 'SOMETHING WENT WRONG' });
//     // its working just failing cuz https
//     dispatch({
//       type: ReducerTypes.delete,
//       id: userIngredients[activeIngredientIndex].id,
//     });
//     setShowModal(false);
//   });
