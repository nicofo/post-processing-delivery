#pragma once

#include "includes.h"
#include <unordered_map>
#include <vector>

//Uniform IDs are global so that we can access them in Graphics System
enum UniformID {
    U_VP,
	U_MVP,
	U_MODEL,
	U_NORMAL_MATRIX,
	U_CAM_POS,
	U_COLOR,
	U_COLOR_MOD,
	U_AMBIENT,
	U_DIFFUSE,
	U_SPECULAR,
	U_SPECULAR_GLOSS,
	U_BLOOM,
	U_USE_DIFFUSE_MAP,
	U_DIFFUSE_MAP,
	U_SKYBOX,
	U_USE_REFLECTION_MAP,
	U_NUM_LIGHTS,
    U_LIGHTS_UBO,
	U_SCREEN_TEXTURE,
	U_NEAR_PLANE,
	U_FAR_PLANE,
	U_LIGHT_MATRIX,
	U_LIGHT_SELECTED,
	U_SHADOW_MAP,
	U_VOLUMETRIC_MAP,
    U_TEX_POSITION,
    U_TEX_NORMAL,
    U_TEX_ALBEDO,
	U_TEX_AMBIENT,
	U_TEX_DEPTH,
	L_TEX_DEPTH,
	U_TEX_PHONG,
	U_TEX_BLOOM,
	U_TEX_BACKGROUND,
	L_DIRECTION,
	L_TYPE,
	L_POSITION,
	L_COLOR,
	L_LINEAR_ATT,
	L_QUADRATIC_ATT,
	L_VIEW_PROJECTION,
    U_SHADOW_MAP0,
    U_SHADOW_MAP1,
    U_SHADOW_MAP2,
    U_SHADOW_MAP3,
    U_SHADOW_MAP4,
    U_SHADOW_MAP5,
    U_SHADOW_MAP6,
    U_SHADOW_MAP7,
	U_VOLUMETRIC_MAP0,
	U_VOLUMETRIC_MAP1,
	U_VOLUMETRIC_MAP2,
	U_VOLUMETRIC_MAP3,
	U_VOLUMETRIC_MAP4,
	U_VOLUMETRIC_MAP5,
	U_VOLUMETRIC_MAP6,
	U_VOLUMETRIC_MAP7,
	UNIFORMS_COUNT
};

//this map allows us to map the uniform string name to our enum ID
const std::unordered_map<std::string, UniformID> uniform_string2id_ = {
	{ "u_vp", U_VP },
    { "u_mvp", U_MVP },
	{ "u_model", U_MODEL },
	{ "u_normal_matrix", U_NORMAL_MATRIX },
	{ "u_cam_pos", U_CAM_POS },
	{ "u_color", U_COLOR },
	{ "u_color_mod", U_COLOR_MOD },
	{ "u_ambient", U_AMBIENT },
	{ "u_diffuse", U_DIFFUSE },
	{ "u_specular", U_SPECULAR },
	{ "u_specular_gloss", U_SPECULAR_GLOSS },
	{ "u_bloom", U_BLOOM },
	{ "u_use_diffuse_map", U_USE_DIFFUSE_MAP },
	{ "u_diffuse_map", U_DIFFUSE_MAP },
	{ "u_skybox", U_SKYBOX },
	{ "u_use_reflection_map", U_USE_REFLECTION_MAP },
	{ "u_num_lights", U_NUM_LIGHTS },
	{ "u_near_plane", U_NEAR_PLANE },
	{ "u_far_plane", U_FAR_PLANE },
	{ "u_light_matrix", U_LIGHT_MATRIX },
	{ "u_light_selected", U_LIGHT_SELECTED },
	{ "u_shadow_map", U_SHADOW_MAP },
	{ "u_volumetric_map", U_VOLUMETRIC_MAP },
    { "u_num_lights", U_NUM_LIGHTS },
	{ "u_screen_texture", U_SCREEN_TEXTURE },
    { "u_tex_position", U_TEX_POSITION },
    { "u_tex_normal", U_TEX_NORMAL },
    { "u_tex_albedo", U_TEX_ALBEDO },
	{ "u_tex_ambient", U_TEX_AMBIENT },
	{ "u_tex_depth", U_TEX_DEPTH },
	{ "l_tex_depth", L_TEX_DEPTH },
	{ "u_tex_phong", U_TEX_PHONG },
	{ "u_tex_bloom", U_TEX_BLOOM },
	{ "u_tex_background", U_TEX_BACKGROUND },
	{ "l_direction", L_DIRECTION },
	{ "l_type", L_TYPE },
	{ "l_position", L_POSITION },
	{ "l_color", L_COLOR },
	{ "l_linear_att", L_LINEAR_ATT },
	{ "l_quadratic_att", L_QUADRATIC_ATT },
	{ "l_view_projection", L_VIEW_PROJECTION },
    { "u_shadow_map[0]", U_SHADOW_MAP0 },
    { "u_shadow_map[1]", U_SHADOW_MAP1 },
    { "u_shadow_map[2]", U_SHADOW_MAP2 },
    { "u_shadow_map[3]", U_SHADOW_MAP3 },
    { "u_shadow_map[4]", U_SHADOW_MAP4 },
    { "u_shadow_map[5]", U_SHADOW_MAP5 },
    { "u_shadow_map[6]", U_SHADOW_MAP6 },
    { "u_shadow_map[7]", U_SHADOW_MAP7 },
	{ "u_volumetric_map[0]", U_VOLUMETRIC_MAP0 },
	{ "u_volumetric_map[1]", U_VOLUMETRIC_MAP1 },
	{ "u_volumetric_map[2]", U_VOLUMETRIC_MAP2 },
	{ "u_volumetric_map[3]", U_VOLUMETRIC_MAP3 },
	{ "u_volumetric_map[4]", U_VOLUMETRIC_MAP4 },
	{ "u_volumetric_map[5]", U_VOLUMETRIC_MAP5 },
	{ "u_volumetric_map[6]", U_VOLUMETRIC_MAP6 },
	{ "u_volumetric_map[7]", U_VOLUMETRIC_MAP7 },
    
};

const std::unordered_map<std::string, UniformID> uniformblock_string2id_ = {
    { "u_lights_ubo", U_LIGHTS_UBO },
};

class Shader {
private:
	//stores, for each uniform enum, it's location
	std::vector<GLuint> uniform_locations_;
	void initUniforms_();
    
public:
    GLuint program;
	std::string name;
	Shader();
    Shader(std::string vertSource, std::string fragSource);
    std::string readFile(std::string filename);
	GLuint compileFromStrings(std::string vsh, std::string fsh);
    GLuint makeVertexShader(const char* shaderSource);
    GLuint makeFragmentShader(const char* shaderSource);
    void makeShaderProgram(GLuint vertexShaderID, GLuint fragmentShaderID);
    GLint bindAttribute(const char* attribute_name);
    void saveProgramInfoLog(GLuint obj);
    void saveShaderInfoLog(GLuint obj);
    std::string log;
    
	//
    GLuint getUniformLocation(UniformID name);
    
    bool setUniform(UniformID id, const int data);
    bool setUniform(UniformID id, const float data);
    bool setUniform(UniformID id, const lm::vec3& data);
    bool setUniform(UniformID id, const lm::mat4& data);
    bool setUniformBlock(UniformID id, const int binding_point);
    bool setTexture(UniformID id, GLuint tex_id, GLuint unit);
    bool setTextureCube(UniformID id, GLuint tex_id, GLuint unit);
    
    
};

