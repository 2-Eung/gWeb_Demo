import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 300000, // LLM 응답 최대 5분
})

export default client
