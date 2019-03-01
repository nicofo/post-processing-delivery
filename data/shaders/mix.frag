#version 330


out vec4 fragColor;

const int MAX_LIGHTS = 8;

//shadows


uniform sampler2D u_tex_phong;
uniform sampler2D u_tex_bloom;
uniform sampler2D u_tex_background;
uniform sampler2D u_volumetric_map[MAX_LIGHTS];
in vec2 v_uv;
uniform int u_num_lights;





void main(){
    vec3 col = texture(u_tex_phong, v_uv).xyz + texture(u_tex_background, v_uv).xyz;
    vec3 col_bloom = texture(u_tex_bloom, v_uv).xyz;
    col = col*0.9 + col_bloom * u_num_lights;
    for (int i = 0; i < u_num_lights; i++) { 
    	col += texture(u_volumetric_map[i], v_uv).xyz;
    }

    fragColor = vec4(col, 1.0);
    //fragColor = vec4(texture(u_tex_bright, v_uv).xyz, 1.0);
    //fragColor = vec4(1.0,0.0, 0.0, 1.0);
}
