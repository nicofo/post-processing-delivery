#version 330

in vec3 v_tex;
//out vec4 fragColor;
layout (location = 2) out vec3 g_background;

uniform samplerCube skybox;
//uniform sampler2D skybox;

void main(){

    g_background = texture(skybox, v_tex).xyz;
}
