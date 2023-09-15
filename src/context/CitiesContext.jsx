import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
const BASE_URL = "http://localhost:3001";

const CitiesContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        isLoading: true,
      };
    case "cities/loaded":
      return {
        ...state,
        cities: action.payload,
        isLoading: false,
      };

    case "city/loaded":
      return {
        ...state,
        currentCity: action.payload,
        isLoading: false,
      };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
      };
    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};
const CitiesProvider = ({ children }) => {
  const [{ cities, isLoading, currentCity }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(() => {
    const fetchCities = async () => {
      try {
        dispatch({
          type: "loading",
        });
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();

        dispatch({
          type: "cities/loaded",
          payload: data,
        });
      } catch (error) {
        dispatch({
          type: "rejected",
          payload: error.message,
        });
      }
    };

    fetchCities();
  }, []);

  const getCity = useCallback(
    async (id) => {
      if (+id === currentCity.id) return;
      try {
        dispatch({
          type: "loading",
        });
        const res = await fetch(`${BASE_URL}/cities/${id}`);
        const data = await res.json();

        dispatch({
          type: "city/loaded",
          payload: data,
        });
      } catch (error) {
        alert("Something went wrong");
        console.log(error);
        dispatch({
          type: "rejected",
          payload: error.message,
        });
      }
    },
    [currentCity.id]
  );

  const createCity = async (newCity) => {
    try {
      dispatch({
        type: "loading",
      });
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-type": "application/json",
        },
      });
      const data = await res.json();
      dispatch({
        type: "city/created",
        payload: data,
      });
    } catch (error) {
      alert("Something went wrong");
      console.log(error);
    }
  };

  const deleteCity = async (id) => {
    try {
      dispatch({
        type: "loading",
      });
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });

      dispatch({
        type: "city/deleted",
        payload: id,
      });
    } catch (error) {
      alert("Something went wrong while deleting");
      console.log(error);
      dispatch({
        type: "rejected",
        payload: error.message,
      });
    }
  };

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
};

const useCities = () => {
  const context = useContext(CitiesContext);

  if (context === undefined) {
    throw new Error("useCities must be used within a CitiesProvider");
  }

  return context;
};

export { useCities, CitiesProvider };
