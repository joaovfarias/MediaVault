import MVLogoText from "../assets/MVLogoText.png";
import { useState, type FormEvent } from "react";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Snackbar,
  TextField,
} from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mostrarSenha: false,
  });
  const [erroMessage, setErroMessage] = useState(
    "Falha ao fazer login. Tente novamente.",
  );
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const handleSendForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then(() => {
          setErroMessage("Falha ao fazer login. Tente novamente.");
          setShowErrorSnackbar(true);
          throw new Error("Falha ao fazer login. Tente novamente.");
        });
      }

      return response
        .json()
        .then(
          (data: {
            token?: string;
            _id: string;
            username: string;
            email: string;
          }) => {
            if (data.token) {
              localStorage.setItem("token", data.token);
            }

            localStorage.setItem("user", JSON.stringify(data));

            navigate("/");
          },
        );
    });
  };

  const handleClickShowPassword = () => {
    setFormData((prev) => ({ ...prev, mostrarSenha: !prev.mostrarSenha }));
  };

  return (
    <div className="relative min-h-[calc(100vh-128px)] flex flex-col items-center justify-center overflow-hidden">
      <img src={MVLogoText} alt="MediaVault Logo" className="w-40" />
      <form
        onSubmit={handleSendForm}
        className="w-full max-w-sm mt-4 gap-3 flex flex-col"
      >
        <TextField
          label="email"
          type="email"
          variant="outlined"
          fullWidth
          size="medium"
          value={formData.email}
          InputLabelProps={{
            sx: {
              "&.Mui-focused": {
                color: "#006D7A",
              },
            },
          }}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#006D7A",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#006D7A",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: "#006D7A",
              },
          }}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          required
        />

        <FormControl variant="outlined" fullWidth required>
          <InputLabel
            htmlFor="senha"
            sx={{
              "&.Mui-focused": {
                color: "#006D7A",
              },
            }}
          >
            senha
          </InputLabel>
          <OutlinedInput
            id="senha"
            type={formData.mostrarSenha ? "text" : "password"}
            value={formData.password}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#006D7A",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#006D7A",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#006D7A",
              },
            }}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            label="Senha"
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    formData.mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                  }
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {formData.mostrarSenha ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>

        <button
          type="submit"
          className="bg-[#006D7A] text-white py-2 px-4 rounded-md hover:bg-[#005a6b] cursor-pointer"
        >
          Entrar
        </button>
      </form>

      <p className="mt-4 text-sm text-[#444746]">
        Não tem uma conta?{" "}
        <a href="/register" className="text-[#006D7A] hover:underline">
          Cadastre-se
        </a>
      </p>

      <p className="mt-4 text-sm text-[#444746]">
        ou{" "}
        <a
          className="text-[#006D7A] hover:underline cursor-pointer"
          onClick={() => navigate("/")}
        >
          Acesse como convidado
        </a>
      </p>

      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowErrorSnackbar(false)}
        message={erroMessage}
      />
    </div>
  );
}
