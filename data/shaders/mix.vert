#version 330

layout(location = 0) in vec3 a_vertex;
layout(location = 1) in vec2 a_uv;
layout(location = 2) in vec3 a_normal;


out vec2 v_uv;

void main(){

	v_uv = a_uv;

	//calculate direction to camera in world space
	//v_cam_dir = u_cam_pos - v_vertex_world_pos;


	gl_Position = vec4(a_vertex, 1.0);
}