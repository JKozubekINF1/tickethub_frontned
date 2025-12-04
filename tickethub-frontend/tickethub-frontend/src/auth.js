import { reactive } from 'vue';
import { useRouter } from 'vue-router';

export const userState = reactive({
    token: localStorage.getItem('token') || null,
    username: localStorage.getItem('username') || null,
});

export function useAuth() {
    const router = useRouter();

    function login(token, username) {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        userState.token = token;
        userState.username = username;
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        userState.token = null;
        userState.username = null;
        router.push('/');
    }

    return { login, logout };
}